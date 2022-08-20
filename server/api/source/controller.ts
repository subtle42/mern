import { Source } from './model'
import { SourceSocket } from './socket'
import { MongoClient } from 'mongodb'
import { Request, Response } from 'express'
import { createReadStream, unlink } from 'fs'
import { ISourceColumn, ColumnType, IQuery, ISource } from 'common/models'
import { ISourceModel, MyRequest } from '../../dbModels'
import * as auth from '../../auth/auth.service'
import config from '../../config/environment'
import * as utils from '../utils'
import { columnInsertEtlFactory, columnInspectFactory } from './factories'
import { Widget } from '../widget/model';
const csv = require('fast-csv')

const parseCSV  = (req: MyRequest): Promise<string[][]> => {
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
            if (bulkResult.nInserted !== rows.length) {
                throw new Error(`Only ${bulkResult.nInserted} out of ${rows.length} in collection ${name}`)
            }
            return name
        })
        .finally(() => client.close())
    })
}

const buildSourceObject = (req: MyRequest, headers: string[], columnTypes: ColumnType[], location: string, rowCount: number): Promise<ISourceModel> => {
    let myColumns: ISourceColumn[] = []

    columnTypes.forEach((type, index) => {
        myColumns.push({
            ref: index.toString(),
            name: headers[index],
            type: type
        })
    })

    let mySource: ISourceModel = new Source({
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

export const update = (req: MyRequest, res: Response): void => {
    const id = req.body._id
    let mySource = new Source(req.body)
    delete req.body._id

    mySource.validate()
    .then(() => Source.findById(id).exec())
    .then(source => {
        return auth.hasEditAccess(req.user._id, source)
        .then(() => {
            if (source.owner !== mySource.owner) {
                return auth.hasOwnerAccess(req.user._id, source)
            }
        })
        .then(() => Source.findByIdAndUpdate(id, req.body).exec())
        .then(() => SourceSocket.onAddOrChange(mySource, source))
    })
    .then(utils.handleResponseNoData(res))
    .catch(utils.handleError(res))
}

export const remove = (req: MyRequest, res: Response): void => {
    Source.findById(req.params.id).exec()
    .then(source => {
        return auth.hasOwnerAccess(req.user._id, source)
        .then(() => Widget.find({ sourceId: req.params.id }).exec())
        .then(widgets => {
            if (widgets.length > 0) {
                return Promise.reject(`There are ${widgets.length} widgets that use this source.`)
            }
        })
        .then(() => source.remove())
        .then(() => SourceSocket.onDelete(source))
    })
    .then(utils.handleResponseNoData(res))
    .catch(utils.handleError(res))
}

export const create = (req: MyRequest, res: Response): void => {
    let fileData: string[][] = []
    let headers: string[] = []
    let columnTypes: ColumnType[] = []


    parseCSV(req)
    .then(data => {
        headers = data[0]
        fileData = data
        fileData.splice(0, 1)
        return data
    })
    .then(data => getColumnTypes(data))
    .then(colTypes => {
        columnTypes = colTypes
        return importData(fileData, colTypes)
    })
    .then(collectionName => buildSourceObject(req, headers, columnTypes, collectionName, fileData.length))
    .then(mySource => {
        return Promise.all(
            mySource.columns.map(col => columnInspectFactory[col.type](mySource.location, col.ref))
        )
        .then(metaData => {
            mySource.columns = mySource.columns.map((col, index) => {
                if (metaData[index].types && metaData[index].types.length > 20) {
                    return Object.assign(col, { type: 'text' })
                }
                return Object.assign(col, metaData[index])
            })
            return mySource
        })
    })
    .then(mySource => Source.create(mySource))
    .then(newSource => {
        SourceSocket.onAddOrChange(newSource)
        res.json(newSource._id)
    })
    .catch(utils.handleError(res))
    .finally(() => unlink(`./${req.file.path}`, () => {
        utils.logger.info(`Removed file: ${req.file.path}`)
    }))
}

export const query = (req: MyRequest, res: Response): void => {
    const myQuery: IQuery = req.body
    let mySource: ISource

    Source.findById(myQuery.sourceId)
    .then(source => mySource = source as any)
    .then(() => {
        if (isHistoQuery(mySource, myQuery)) {
            return buildHistogramQuery(mySource, myQuery)
        } else {
            return buildMongoQuery(mySource, myQuery)
        }
    })
    .then(query => runMongoQuery(mySource, query))
    .then(utils.handleResponse(res))
    .catch(utils.handleError(res))
}

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
    let output = []
    addFiltersToQuery(source, input, output)

    let groupByObj = {
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

const runMongoQuery = (source: ISource, query: any[]): Promise<any[]> => {
    if (query.length === 0) return Promise.resolve([])
    return MongoClient.connect(`mongodb://${config.db.mongoose.data.host}:${config.db.mongoose.data.port}`)
    .then(client => {
        const db = client.db(config.db.mongoose.data.dbname)
        return db.collection(source.location).aggregate(query)
        // .limit(500)
        .toArray()
        .finally(() => client.close())
    })
}

export const getMySources = (req: MyRequest, res: Response): void => {
    const userId = req.user._id
    Source.find({
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
    .then(utils.handleResponse(res))
    .catch(utils.handleError(res))
}

export const getSource = (req: MyRequest, res: Response): void => {
    Source.findById(req.params.id).exec()
    .then(source => {
        return auth.hasViewerAccess(req.user._id, source)
        .then(() => source)
    })
    .then(utils.handleResponse(res))
    .catch(utils.handleError(res))
}

