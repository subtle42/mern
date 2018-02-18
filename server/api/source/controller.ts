import {Source} from "./model";
import {MongoClient, Db, Server} from "mongodb";
import {Request, Response} from "express";
import {createReadStream, unlink} from "fs";
import {ISourceColumn, ColumnType} from "myModels";
import {ISourceModel} from "../../dbModels";
import * as Promise from "bluebird";
import Util from "../utils";
var csv = require("fast-csv");

export default class SourceController {
    private static parseCSV(req:Request):Promise<string[][]> {
        return new Promise((resolve:Function, reject:Function) => {
            var response = [];

            var stream = createReadStream(req.file.path);
            var csvStream = csv.parse({
                ignoreEmpty:true,
                trim:true
            })
            .on("data", (data:Array<string>) => response.push(data))
            .on("end", () => resolve(response));

            stream.pipe(csvStream);
        });
    }

    private static rowsToColumns(rows:Array<string[]>):Promise<string[][]> {
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

    private static getColumnTypes(data:Array<Array<string>>):Promise<ColumnType[]> {
        return new Promise((resolve:Function) => {
            var calls:Array<Promise<string>> = [];
            data.forEach(column => calls.push(this.getSingleColumnType(column)));
            Promise.all(calls)
            .then(columnTypes => resolve(columnTypes));
        });
    }

    private static getSingleColumnType(data:any[]):Promise<ColumnType> {
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

    private static importData(rows:Array<any[]>, columnTypes:ColumnType[]):Promise<string> {
        var headers:Array<string> = [];
        var name = "mean_" + new Date().getTime();
        var myDb = new Db("mean-data", new Server("localhost", 27017));
        return myDb.open()
        .then(db => {
            var myCollection = db.collection(name);
            var batch = myCollection.initializeUnorderedBulkOp();

            rows.forEach(row => {
                row.forEach((entry, index) => {
                    row[index] = entry.replace("$", "");
                    if (columnTypes[index] === "number") {
                        row[index] = parseInt(entry);
                    }
                });
                batch.insert(row)
            });

            return batch.execute()
        })
        .then(bulkResult => {
            myDb.close();
            if (bulkResult.nInserted !== rows.length) {
                throw `Only ${bulkResult.nInserted} out of ${rows.length} in collection ${name}`;
            }
            return name;
        })
        .catch(err => {
            try {myDb.close();}
            catch(myerr) {}
            throw err;
        }) as Promise<string>;
    }

    private static buildSourceObject(req:Request, headers:string[], columnTypes:ColumnType[], location:string, rowCount:number):Promise<ISourceModel> {
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

    public static update(req:Request, res:Response):void {
        const id = req.body._id;
        delete req.body._id;
        Source.findByIdAndUpdate(id, req.body).exec()
        .then(Util.handleResponse(res))
        .catch(Util.handleError(res));
    }

    public static remove(req:Request, res:Response):void {
        Source.findByIdAndRemove(req.params.id).exec()
        .then(Util.handleResponseNoData(res))
        .catch(Util.handleError(res));
    }

    public static create(req:Request, res:Response):void {
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
        .then(data => this.rowsToColumns(data))
        .then(data => this.getColumnTypes(data))
        .then(colTypes => {
            columnTypes = colTypes;
            return this.importData(fileData, colTypes);
        })
        .then(collectionName => this.buildSourceObject(req, headers, columnTypes, collectionName, fileData.length))
        .then(mySource => Source.create(mySource))
        .then(newSource => {
            unlink("./" + req.file.path, () => {
                res.json(newSource)
            });
        })
        .catch(err => {
            unlink("./" + req.file.path, () => {
                res.status(500).json(err)
            });
        });
    }
}