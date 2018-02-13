import {Book, bookSocket} from "./model";
import {Request, Response} from "express";
import Util from "../utils";

export default class BookController {
    public static create(req:Request, res:Response):void {
        var myBook = new Book({
            name: req.body.name,
            owner: req.user._id
        });

        myBook.validate()
        .then(() => Book.create(myBook))
        .then(data => {
            bookSocket.onAddOrChange(myBook);
            return data;
        })
        .then(Util.handleNoResult(res))
        .then(Util.handleResponse(res))
        .catch(Util.handleError(res));
    }

    public static update(req:Request, res:Response):void {
        var myId:string = req.body._id;
        delete req.body._id;
        var myBook = new Book(req.body);

        myBook.validate()
        .then(pass => Book.findById(myId))
        .then(oldBook => {
            Book.findByIdAndUpdate(myId, myBook).exec()
            .then(data => bookSocket.onAddOrChange(myBook, oldBook))
            .then(Util.handleNoResult(res))
            .then(Util.handleResponseNoData(res))
            .catch(Util.handleError(res));
        });
        // myBook.validate()
        // .then(pass => Book.findByIdAndUpdate(myId, myBook).exec())
        // .then(Util.handleNoResult(res))
        // .then(Util.handleResponseNoData(res))
        // .catch(Util.handleError(res));
    }

    public static remove(req:Request, res:Response):void {
        var myId:string = req.params.id;

        Book.findByIdAndRemove(myId).exec()
        .then(() => res.json())
        .catch(Util.handleError(res));
    }

    public static index(req:Request, res:Response):void {
        let userId:string = "dan";//req.user._id;
        Book.find({
            $or: [{
                owner: userId
            }, {
                editors: {$elemMatch: { $eq: userId }}
            }, {
                viewers: {$elemMatch: { $eq: userId }}
            }]
        }).exec()
        .then(Util.handleResponse(res))
        .catch(Util.handleError(res));
    }
}