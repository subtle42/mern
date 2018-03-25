import {Source} from "./model";
import {MongoClient, Db, Server} from "mongodb";
import {Request, Response} from "express";
import {createReadStream, unlink} from "fs";
import {ISourceColumn, ColumnType} from "myModels";
import {ISourceModel} from "../../dbModels";
import * as Promise from "bluebird";
import Util from "../utils";
var csv = require("fast-csv");


class SourceController {
    private parseCSV(req:Request):Promise<string[][]> {
        return new Promise((resolve:Function, reject:Function) => {
            var response = [];
            console.log('starting');
            var stream = createReadStream(req.file.path);
            var csvStream = csv.parse({
                ignoreEmpty:true,
                trim:true
            })
            .on("data", (data:Array<string>) => response.push(data))
            .on("end", () => {
                console.log(`done: ${response.length}`)
                console.log(`col count: ${response[0].length}`)
                resolve(response)
            });
    
            stream.pipe(csvStream);
        });
    }

    private rowsToColumns(rows:Array<string[]>):Promise<string[][]> {
        return new Promise((resolve:Function) => {
            var response:Array<Array<string>> = [];

            rows.forEach(row => response.push([]));
            rows.forEach((row) => {
                row.forEach((entry:string, index:number) => {
                    response[index].push(entry);
                });
            });

            resolve(response);
        });
    }

    private getColumnTypes(data:Array<Array<string>>):Promise<ColumnType[]> {
        var calls:Array<Promise<string>> = [];
        const dataSubSet:string[][] = data.slice(0, 100);
        const dataByCol:string[][] = [];
        dataSubSet[0].forEach((item, index) => dataByCol.push([]))
        console.log(`data by col: ${dataByCol.length}`)
        dataSubSet[0].forEach((item, index) => dataByCol[index].push(item));

        
        dataByCol.forEach(column => calls.push(this.getSingleColumnType(column)));
        return Promise.all(calls)
    }

    private getSingleColumnType(data:any[]):Promise<ColumnType> {
        return new Promise((resolve:Function) => {
            var number = 0;
            var group = 0;
            var date = 0;
            var groupCounts = {};
            var response:ColumnType;

            data.forEach(entry => {
                if(!isNaN(entry)) {
                    number++
                }
                else {
                    groupCounts[entry] = groupCounts[entry] ? groupCounts[entry] + 1 : 1;
                }
            });

            if(number === data.length) {
                response = "number";
            }
            else if (Object.keys(groupCounts).length/data.length < 1) {
                response = "group";
            }
            else {
                response = "text";
            }

            resolve(response);
        });
    }

    private importData(rows:Array<any[]>, columnTypes:ColumnType[]):Promise<string> {
        var headers:Array<string> = [];
        var name = "mean_" + new Date().getTime();
        // var myDb = new Db("mean-data", new Server("localhost", 27017));
        return MongoClient.connect(`mongodb://localhost:27017`)
        .then(client => {
            console.log("have client")
            const db = client.db("mean-data");
            return db.createCollection(name)
            .then(collect => {
                const batch = collect.initializeUnorderedBulkOp();
                rows.forEach(row => {
                    let item = {};
                    row.forEach((entry, index) => {
                        if (columnTypes[index] === "number") {
                            row[index] = entry.replace("$", "");
                            item[index] = parseInt(entry);
                        }
                        else {
                            item[index] = entry;
                        }
                    });
                    // console.log(entry)
                    batch.insert(item)
                });
                return batch.execute()
            })
            .then(bulkResult => {
                client.close();
                if (bulkResult.nInserted !== rows.length) {
                    throw `Only ${bulkResult.nInserted} out of ${rows.length} in collection ${name}`;
                }
                return name;
            })
            .catch(err => {
                client.close();
                throw err;
            })
        }) as Promise<string>;
    }

    private buildSourceObject(req:Request, headers:string[], columnTypes:ColumnType[], location:string, rowCount:number):Promise<ISourceModel> {
        return new Promise((resolve, reject) => {
            var myColumns:ISourceColumn[] = [];

            columnTypes.forEach((type, index) => {
                myColumns.push({
                    ref: index.toString(),
                    name: headers[index],
                    type: type
                });
            });

            var mySource:ISourceModel = new Source({
                title: req.file.filename,
                location: location,
                size: req.file.size,
                rowCount: rowCount,
                columns: myColumns,
                owner: req.user._id
            });

            mySource.validate()
            .then(pass => resolve(mySource))
            .catch(err => reject(err));
        });
    }

    update(req:Request, res:Response):void {
        const id = req.body._id;
        delete req.body._id;
        Source.findByIdAndUpdate(id, req.body).exec()
        .then(Util.handleResponse(res))
        .catch(Util.handleError(res));
    }

    remove(req:Request, res:Response):void {
        Source.findByIdAndRemove(req.params.id).exec()
        .then(Util.handleResponseNoData(res))
        .catch(Util.handleError(res));
    }

    create(req:Request, res:Response):void {
        var fileData:string[][] = [];
        var headers:string[] = [];
        var columnTypes:ColumnType[] = [];

        this.parseCSV(req)
        .then(data => {
            headers = data[0];
            fileData = data;
            fileData.splice(0, 1);
            return data;
        })
        .then(data => this.getColumnTypes(data))
        .then(colTypes => {
            columnTypes = colTypes;
            return this.importData(fileData, colTypes);
        })
        .then(collectionName => this.buildSourceObject(req, headers, columnTypes, collectionName, fileData.length))
        .then(mySource => Source.create(mySource))
        .then(newSource => {
            console.log('source: ', newSource)
            unlink("./" + req.file.path, () => {
                res.json(newSource)
            });
        })
        .catch(err => {
            unlink("./" + req.file.path, () => {
                console.error(err)
                res.status(500).json(err)
            });
        });
    }
}

export const controller = new SourceController();