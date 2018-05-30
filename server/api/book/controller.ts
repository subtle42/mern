import {Book} from "./model";
import {BookSocket} from "./socket";
import {Request, Response} from "express";
import Util from "../utils";

export default class BookController {
    /**
     * Creates a book and sets the current user as owner
     * @param req 
     * @param res 
     */
    public static create(req:Request, res:Response):void {
        var myBook = new Book({
            name: req.body.name,
            owner: req.user._id
        });

        myBook.validate()
        .then(() => Book.create(myBook))
        .then(data => {
            BookSocket.onAddOrChange(myBook);
            return myBook;
        })
        .then(Util.handleNoResult(res))
        .then(data => data._id)
        .then(Util.handleResponse(res))
        .catch(Util.handleError(res));
    }

    /**
     * Updates a book, only the owner or editors can make updates
     * @param req
     * @param res 
     */
    public static update(req:Request, res:Response):void {
        var myId:string = req.body._id;
        var myBook = new Book(req.body);
        delete req.body._id;

        myBook.validate()
        .then(pass => Book.findById(myId))
        .then(oldBook => {
            if (oldBook.owner !== req.user._id && oldBook.editors.indexOf(req.user._id) === -1) {
                throw Error(`User: ${req.user._id} is neither an owner or editor of Book: ${myId}`)
            }

            return Book.findByIdAndUpdate(myId, req.body).exec()
            .then(data => BookSocket.onAddOrChange(myBook, oldBook))
        })
        .then(Util.handleResponseNoData(res))
        .catch(Util.handleError(res));
    }

    /**
     * Deletes a book, only the owner can do this action
     * @param req 
     * @param res 
     */
    public static remove(req:Request, res:Response):void {
        var myId:string = req.params.id;

        Book.findById(myId).exec()
        .then(book => {
            if (book.owner !== req.user._id) {
                throw `User ${req.user._id} is not owner and cannot delete book: ${book._id}`
            }
            return book.remove()
            .then(() => BookSocket.onDelete(book))
        })
        .then(() => res.json().status(200))
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