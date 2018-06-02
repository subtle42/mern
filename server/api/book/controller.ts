import {Book} from "./model";
import {BookSocket} from "./socket";
import {Request, Response, NextFunction} from "express";
import Util from "../utils";
import { IBookModel } from "../../dbModels";

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
        .then(pass => Book.findById(myId).exec())
        .then(oldBook => {
            return Book.findByIdAndUpdate(myId, req.body).exec()
            .then(data => BookSocket.onAddOrChange(myBook, oldBook))
        })
        .then(Util.handleResponseNoData(res))
        .catch(Util.handleError(res));
    }

    public static hasOwnerAccess(req:Request, res:Response, next:NextFunction):void {
        const bookId:string = req.params.id || req.body._id;
        Book.findById(bookId)
        .then(book =>  {
            if (book.owner === req.user._id) return;
            return Promise.reject(`You are not the owner of book: ${book._id}, you do not have delete rights.`)
        })
        .then(() => next())
        .catch(Util.handleError(res))
    }

    public static hasEditorAccess(req:Request, res:Response, next:NextFunction):void {
        const bookId:string = req.params.id || req.body._id;
        const toUpdate:IBookModel = req.body;
        Book.findById(bookId)
        .then(book =>  {
            if (book.owner !== toUpdate.owner && book.owner !== req.user._id) {
                return Promise.reject(`Only the owner of the book: ${book._id}, can edit the owner field.`)
            }
            
            if (book.owner === req.user._id) return;
            if (book.editors.indexOf(req.user._id) !== -1) return;
            return Promise.reject(`You are not an editor of book: ${book._id}, you do not have edit rights.`)
        })
        .then(() => next())
        .catch(Util.handleError(res))
    }
 
    /**
     * Deletes a book, only the owner can do this action
     * @param req 
     * @param res 
     */
    public static remove(req:Request, res:Response):void {
        var myId:string = req.params.id;

        Book.findById(myId).exec()
        .then(book => BookSocket.onDelete(book))
        .then(Util.handleResponseNoData(res))
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