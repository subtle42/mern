import { Source } from './model'
import { SourceSocket } from './socket'
import { MongoClient } from 'mongodb'
import { Request, Response } from 'express'
import { createReadStream, unlink } from 'fs'
import { ISourceColumn, ColumnType, IQuery, ISource } from 'common/models'
// import { ISourceModel, MyRequest } from '../../dbModels'
import * as auth from '../../auth/auth.service'
import config from '../../config/environment'
import * as utils from '../utils'
import { handleApiCall } from '../utils'
import { columnInsertEtlFactory, columnInspectFactory } from './factories'
import { Widget } from '../widget/model';
const csv = require('fast-csv')

const parseCSV  = (req: Request): Promise<string[][]> => {
    console.log('request file',req.file)
    
    return new Promise(resolve => {
        let response = []
        let stream = createReadStream(req.file.path)
        let csvStream = csv.parse({
            ignoreEmpty: true,
            trim: true
        })
        .on('data', (data: Array<string>) => response.push(data))
        .on('end', () => resolve(response))

        stream.pipe(csvStream)
    })
}

const getColumnTypes = (data: Array<Array<string>>): Promise<ColumnType[]> => {
    const dataByCol: any[][] = data[0].map(x => [])
    data.slice(0, 100).forEach(row => {
        row.forEach((item, index) => {
            dataByCol[index].push(item)
        })
    })

    return Promise.resolve(dataByCol.map(row => getSingleColumnType(row)))
}

const getSingleColumnType = (data: any[]): ColumnType => {
    let isText = 0
    let isNumber = 0
    let isDate = 0
    let groupCounts = {}
    let response: ColumnType = 'text'

    data.forEach(entry => {
        if (entry === '') return
        if (!isNaN(entry)) {
            isNumber++
        } else if (entry.length > 50) {
            isText++
        } else if (!isNaN(Date.parse(entry))) {
            isDate++
        } else {
            groupCounts[entry] = groupCounts[entry] ? groupCounts[entry] + 1 : 1
        }
    })

    const keys = Object.keys(groupCounts).filter(key => groupCounts[key] > 1)
    if (isNumber === data.length) {
        response = 'number'
    } else if (isDate === data.length) {
        response = 'datetime'
    } else if (isText > 0) {
        response = 'text'
    } else if (keys.length > 0 && keys.length < 20) {
        response = 'group'
    }

    return response
}

const importData = (rows: Array<any[]>, columnTypes: ColumnType[]): Promise<string> => {
    let name = 'mern_' + new Date().getTime()

    const toInsert = rows.map(row => {
        let item = {}
        row.forEach((entry, index) => {
            item[index] = columnInsertEtlFactory[columnTypes[index]](entry)
        })
        return item
    })

    return MongoClient.connect(`mongodb://${config.db.mongoose.data.host}:${config.db.mongoose.data.port}`)
    .then(client => {
        const db = client.db(config.db.mongoose.data.dbname)
        return db.createCollection(name)
        .then(collect => {
            const batch = collect.initializeUnorderedBulkOp()
            toInsert.forEach(row => batch.insert(row))
            return batch.execute()
        })
        .then(bulkResult => {
            if (bulkResult.insertedCount !== rows.length) {
                throw new Error(`Only ${bulkResult.insertedCount} out of ${rows.length} in collection ${name}`)
            }
            return name
        })
        .finally(() => client.close())
    })
}

const buildSourceObject = (req: Request, headers: string[], columnTypes: ColumnType[], location: string, rowCount: number) => {
    let myColumns: ISourceColumn[] = []

    columnTypes.forEach((type, index) => {
        myColumns.push({
            ref: index.toString(),
            name: headers[index],
            type: type
        })
    })

    let mySource = new Source({
        title: req.file.originalname,
        location: location,
        size: req.file.size,
        rowCount: rowCount,
        columns: myColumns,
        owner: req.user._id
    })

    return mySource.validate()
    .then(() => mySource)
}

export const update = handleApiCall(async(req, res) => {
    const id = req.body._id
    let mySource = new Source(req.body)
    delete req.body._id

    await mySource.validate()
    const oldSource = await Source.findById(id).exec()
    
    await auth.hasEditAccess(req.user._id, oldSource)
    if (oldSource.owner !== mySource.owner) {
        await auth.hasOwnerAccess(req.user._id, oldSource)
    }
    await Source.findByIdAndUpdate(id, req.body).exec()
    await SourceSocket.onAddOrChange(mySource, oldSource)
    utils.handleResponseNoData(res)()
})



export const remove = handleApiCall(async(req, res) => {
    const mySource = await Source.findById(req.params.id).exec()
    await auth.hasOwnerAccess(req.user._id, mySource)
    const widgets = await Widget.find({ sourceId: req.params.id}).exec()

    if (widgets.length > 0) throw new Error(`There are ${widgets.length} widgets that use this source.`)
    
    await mySource.deleteOne()
    SourceSocket.onDelete(mySource)
    utils.handleResponseNoData(res)()
})

export const create = async(req: Request, res: Response) => {
    // let fileData: string[][] = []
    // let headers: string[] = []
    // let columnTypes: ColumnType[] = []

    try {
        const data = await parseCSV(req)
        const headers = data[0]
        const fileData = data
        fileData.splice(0, 1)
        const columnTypes = await getColumnTypes(data)
        const collectionName = await importData(fileData, columnTypes)
        const mySource = await buildSourceObject(req, headers, columnTypes, collectionName, fileData.length)
    
        const metaData = await Promise.all(
            mySource.get('columns').map(col => columnInspectFactory[col.type](mySource.location, col.ref))
        )
        mySource.set('columns', mySource.get('columns').map((col, index) => {
            if (metaData[index].types && metaData[index].types.length > 20) {
                return Object.assign(col, { type: 'text' })
            }
            return Object.assign(col, metaData[index])
        }))
        const newSource = await Source.create(mySource)
        SourceSocket.onAddOrChange(newSource)
        res.json(newSource._id)
    }
    catch(err) {
        utils.handleError(err)
    }
    finally {
        unlink(`./${req.file.path}`, () => {
            utils.logger.info(`Removed file: ${req.file.path}`)
        })
    }

    // parseCSV(req)
    // .then(data => {
    //     headers = data[0]
    //     fileData = data
    //     fileData.splice(0, 1)
    //     return data
    // })
    // .then(data => getColumnTypes(data))
    // .then(colTypes => {
    //     columnTypes = colTypes
    //     return importData(fileData, colTypes)
    // })
    // .then(collectionName => buildSourceObject(req, headers, columnTypes, collectionName, fileData.length))
    // .then(mySource => {
    //     return Promise.all(
    //         mySource.columns.map(col => columnInspectFactory[col.type](mySource.location, col.ref))
    //     )
    //     .then(metaData => {
    //         mySource.columns = mySource.columns.map((col, index) => {
    //             if (metaData[index].types && metaData[index].types.length > 20) {
    //                 return Object.assign(col, { type: 'text' })
    //             }
    //             return Object.assign(col, metaData[index])
    //         })
    //         return mySource
    //     })
    // })
    // .then(mySource => Source.create(mySource))
    // .then(newSource => {
    //     SourceSocket.onAddOrChange(newSource)
    //     res.json(newSource._id)
    // })
    // .catch(utils.handleError(res))
    // .finally(() => unlink(`./${req.file.path}`, () => {
    //     utils.logger.info(`Removed file: ${req.file.path}`)
    // }))
}

export const query = handleApiCall(async(req, res) => {
    const myQuery: IQuery = req.body

    const mySource = await Source.findById(myQuery.sourceId)
    const query = isHistoQuery(mySource, myQuery)
        ? await buildHistogramQuery(mySource, myQuery)
        : await buildMongoQuery(mySource, myQuery)
    const queryResults = await runMongoQuery(mySource, query)
    utils.handleResponse(res)(queryResults)
})

const FilterFactory = {
    number: (filter: number[]) => {
        return { $gte: filter[0], $lte: filter[1] }
    },
    group: (filter: string[]) => {
        return { $in: filter }
    },
    datetime: (filter: string[]) => {
        return {
            $gte: new Date(filter[0]),
            $lt: new Date(filter[1])
        }
    }
}

const getFilterQuery = (dimension: string, filter: any[], source: ISource) => {
    const col = source.columns.find(col => col.ref === dimension)
    return FilterFactory[col.type](filter)
}

const addFiltersToQuery = (source: ISource, input: IQuery, output: any[]) => {
    const dimensions = Object.keys(input.filters)
    if (dimensions.length === 0) return

    output.push({
        $match: {
            $and: dimensions.map(dimension => ({
                [dimension]: getFilterQuery(dimension, input.filters[dimension], source)
            }))
        }
    })
}

const buildHistogramQuery = (source: ISource, input: IQuery): Promise<any> => {
    const colRef = input.dimensions[0]
    const output = []
    addFiltersToQuery(source, input, output)
    output.push({
        $group: {
            _id: {},
            min: { $min: `$${colRef}` },
            max: { $max: `$${colRef}` }
        }
    })

    return MongoClient.connect(`mongodb://${config.db.mongoose.data.host}:${config.db.mongoose.data.port}`)
    .then(client => {
        const db = client.db(config.db.mongoose.data.dbname)
        return db.collection(source.location).aggregate(output)
        .toArray()
        .then(data => data[0] || {
            min: 0,
            max: 0
        })
        .finally(() => client.close())
    })
    .then(metaData => {
        const { min, max } = metaData
        let step = Math.floor((max - min) / 20)

        if ((max - min) / 20 < 1) {
            step = (max - min) / 20
        }
        if (step === 0) return []

        const boundaries = [min]
        let index = 1
        while (boundaries[boundaries.length - 1] < max) {
            boundaries.push(min + step * index)
            index++
        }
        if (boundaries[boundaries.length - 1] === max) {
            boundaries.push(min + step * index)
        }

        const toReturn = []
        if (max === min) return []
        addFiltersToQuery(source, input, output)
        toReturn.push({
            $bucket: {
                groupBy: `$${colRef}`,
                boundaries,
                default: 'Other',
                output: {
                    // entries : { $push: `$${colRef}` },
                    count: { $sum: 1 }
                }
            }
        })
        return toReturn
    })
}

const isHistoQuery = (source: ISource, input: IQuery): boolean => {
    return input.dimensions.length === 1
        && input.measures.length === 0
        && source.columns.find(col => col.ref === input.dimensions[0]).type === 'number'
}

const buildMongoQuery = (source: ISource, input: IQuery): any[] => {
    const output = []
    addFiltersToQuery(source, input, output)

    const groupByObj = {
        _id: input.measures.length > 0 ? `$${input.dimensions[0]}` : '$_id',
        count: { $sum: 1 }
    }

    if (input.measures.length === 0) {
        input.dimensions.forEach(dim => {
            groupByObj[dim] = { $sum: `$${dim}` }
        })
    }

    input.measures
    .filter(measure => measure.ref !== 'count')
    .forEach(measure => {
        groupByObj[measure.ref] = { $sum: `$${measure.ref}` }
    })

    output.push({
        $group: groupByObj
    })

    if (source.columns.find(col => col.ref === input.dimensions[0]).type === 'datetime') {
        output.push({
            $sort: { _id: -1 }
        })
    }

    return output
}

const runMongoQuery = async(source: ISource, query: any[]): Promise<any[]> => {
    if (query.length === 0) return Promise.resolve([])
    const client = await MongoClient.connect(`mongodb://${config.db.mongoose.data.host}:${config.db.mongoose.data.port}`)
    const db = client.db(config.db.mongoose.data.dbname)
    
    return db.collection(source.location).aggregate(query)
        // .limit(500)
        .toArray()
        .finally(() => client.close())
}

export const getMySources = handleApiCall(async(req, res) => {
    const userId = req.user._id
    const mySources = await Source.find({
        $or: [{
            owner: userId
        }, {
            editors: userId
        }, {
            viewers: userId
        }, {
            isPublic: true
        }]
    })
    utils.handleResponse(res)(mySources.map(x => x.toJSON()))
})

export const getSource = handleApiCall(async(req, res) => {
    const mySource = await Source.findById(req.params.id).exec()
    await auth.hasViewerAccess(req.user._id, mySource)
    utils.handleResponse(res)(mySource.toJSON())
})
