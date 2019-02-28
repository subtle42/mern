import { Source } from './model'
import { SourceSocket } from './socket'
import { MongoClient, AggregationCursor } from 'mongodb'
import { Request, Response } from 'express'
import { createReadStream, unlink } from 'fs'
import { ISourceColumn, ColumnType, IQuery, ISource } from 'common/models'
import { ISourceModel } from '../../dbModels'
import * as auth from '../../auth/auth.service'
import config from '../../config/environment'
import * as utils from '../utils'
const csv = require('fast-csv')

class SourceController {
    private parseCSV (req: Request): Promise<string[][]> {
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

    private getColumnTypes (data: Array<Array<string>>): Promise<ColumnType[]> {
        let calls: Array<Promise<string>> = []
        const dataSubSet: string[][] = data.slice(0, 100)
        const dataByCol: string[][] = []
        dataSubSet[0].forEach((item, index) => dataByCol.push([]))
        dataSubSet[0].forEach((item, index) => dataByCol[index].push(item))

        dataByCol.forEach(column => calls.push(this.getSingleColumnType(column)))
        return Promise.all(calls) as Promise<ColumnType[]>
    }

    private getSingleColumnType (data: any[]): Promise<ColumnType> {
        return new Promise((resolve: Function) => {
            let isNumber = 0
            let groupCounts = {}
            let response: ColumnType

            data.forEach(entry => {
                if (!isNaN(entry)) {
                    isNumber++
                } else {
                    groupCounts[entry] = groupCounts[entry] ? groupCounts[entry] + 1 : 1
                }
            })

            if (isNumber === data.length) {
                response = 'number'
            } else if (Object.keys(groupCounts).length / data.length < 1) {
                response = 'group'
            } else {
                response = 'text'
            }

            resolve(response)
        })
    }

    private importData (rows: Array<any[]>, columnTypes: ColumnType[]): Promise<string> {
        let name = 'mern_' + new Date().getTime()

        return MongoClient.connect(`mongodb://${config.db.mongoose.data.host}:${config.db.mongoose.data.port}`)
        .then(client => {
            const db = client.db(config.db.mongoose.data.dbname)
            return db.createCollection(name)
            .then(collect => {
                const batch = collect.initializeUnorderedBulkOp()
                rows.forEach(row => {
                    let item = {}
                    row.forEach((entry, index) => {
                        if (columnTypes[index] === 'number') {
                            row[index] = entry.replace('$', '')
                            item[index] = parseInt(entry, 10)
                        } else {
                            item[index] = entry
                        }
                    })
                    batch.insert(item)
                })
                return batch.execute()
            })
            .then(bulkResult => {
                client.close()
                if (bulkResult.nInserted !== rows.length) {
                    throw new Error(`Only ${bulkResult.nInserted} out of ${rows.length} in collection ${name}`)
                }
                return name
            })
            .catch(err => {
                client.close()
                throw err
            })
        })
    }

    private buildSourceObject (req: Request, headers: string[], columnTypes: ColumnType[], location: string, rowCount: number): Promise<ISourceModel> {
        // return new Promise((resolve, reject) => {
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
            // .then(pass => resolve(mySource))
            // .catch(err => reject(err));
        // });
    }

    update (req: Request, res: Response): void {
        const id = req.body._id
        let mySource = new Source(req.body)
        delete req.body._id

        mySource.validate()
        .then(() => Source.findById(id).exec())
        .then(source => {
            return auth.hasEditAccess(req.user._id, source)
            .then(() => {
                if (source.owner !== mySource.owner && source.owner !== req.user._id) {
                    return Promise.reject(`Only the owner of source: ${source._id}, can the owner field`)
                }
            })
            .then(() => Source.findByIdAndUpdate(id, req.body).exec())
            .then(() => SourceSocket.onAddOrChange(mySource, source))
        })
        .then(utils.handleResponseNoData(res))
        .catch(utils.handleError(res))
    }

    remove (req: Request, res: Response): void {
        Source.findById(req.params.id).exec()
        .then(source => {
            return auth.hasOwnerAccess(req.user._id, source)
            .then(() => source.remove())
            .then(() => SourceSocket.onDelete(source))
        })
        .then(utils.handleResponseNoData(res))
        .catch(utils.handleError(res))
    }

    create (req: Request, res: Response): void {
        let fileData: string[][] = []
        let headers: string[] = []
        let columnTypes: ColumnType[] = []

        this.parseCSV(req)
        .then(data => {
            headers = data[0]
            fileData = data
            fileData.splice(0, 1)
            return data
        })
        .then(data => this.getColumnTypes(data))
        .then(colTypes => {
            columnTypes = colTypes
            return this.importData(fileData, colTypes)
        })
        .then(collectionName => this.buildSourceObject(req, headers, columnTypes, collectionName, fileData.length))
        .then(mySource => Source.create(mySource))
        .then(newSource => {
            SourceSocket.onAddOrChange(newSource)
            unlink('./' + req.file.path, () => {
                res.json(newSource._id)
            })
        })
        .catch(err => {
            unlink('./' + req.file.path, () => {
                console.error(err)
                res.status(500).json(err)
            })
        })
    }

    query (req: Request, res: Response): void {
        const myQuery: IQuery = req.body
        let mySource: ISource

        Source.findById(myQuery.sourceId)
        .then(source => mySource = source)
        .then(() => this.buildMongoQuery(mySource, myQuery))
        .then(query => this.runMongoQuery(mySource, query))
        .then(utils.handleResponse(res))
        .catch(utils.handleError(res))
    }

    private buildMongoQuery (source: ISource, input: IQuery): any[] {
        let output = []
        if (input.filters.length > 0) {
            output.push({
                $match: {
                    $and: input.filters.map(filter => {
                        const sourceColumn = source.columns.filter(col => col.ref === filter.ref)[0]
                        let singleFilter = {}
                        if (sourceColumn.type === 'number') {
                            singleFilter[filter.ref] = { $elemMatch: [{ $gte: filter.range[0] }, { $lt: filter.range[1] }] }
                        } else if (sourceColumn.type === 'group') {
                            singleFilter[filter.ref] = { $in: filter.option }
                        }
                    })
                }
            })
        }

        let groupByObj = {
            _id: input.dimensions.length > 0 ? `$${input.dimensions[0]}` : '$_id',
            count: { $sum: 1 }
        }
        input.measures.forEach(measure => {
            groupByObj[measure.ref] = { $sum: `$${measure.ref}` }
        })
        input.dimensions.forEach(dim => {
            groupByObj[dim] = { $sum: `$${dim}` }
        })

        output.push({
            $group: groupByObj
        })

        return output
    }

    private runMongoQuery (source: ISource, query: any[]): Promise<any[]> {
        return new Promise((resolve, reject) => {
            MongoClient.connect(`mongodb://${config.db.mongoose.data.host}:${config.db.mongoose.data.port}`)
            .then(client => {
                const db = client.db(config.db.mongoose.data.dbname)
                db.collection(source.location).aggregate(query,{}, (err, data: any) => {
                    if (err) return reject(err)
                    const cursor: AggregationCursor = data
                    cursor.toArray().then(results => {
                        client.close()
                        resolve(results)
                    })
                })
            })
            .catch(err => reject(err))
        })
    }

    getMySources (req: Request, res: Response): void {
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

    getSource (req: Request, res: Response): void {
        Source.findById(req.params.id).exec()
        .then(source => {
            return auth.hasViewerAccess(req.user._id, source)
            .then(() => source)
        })
        .then(utils.handleResponse(res))
        .catch(utils.handleError(res))
    }
}

export const controller = new SourceController()
