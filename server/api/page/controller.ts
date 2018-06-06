import {Request, Response, NextFunction} from "express";
import Page from "./model";
import {Book} from "../book/model"
import Util from "../utils";
import {pageSocket} from "./socket";

export default class PageController {
    /**
     * Creates a page as part of a book
     * @param req 
     * @param res 
     */
    public static create(req:Request, res:Response):void {
        var myPage = new Page({
            name: req.body.name,
            bookId: req.body.bookId
        });

        myPage.validate()
        .then(() => Page.create(myPage))
        .then(Util.handleNoResult(res))
        .then(page => {
            pageSocket.onAddOrChange(page);
            return res.json(page._id);
        })
        .catch(Util.handleError(res));
    }

    /**
     * Does current user have edit access to the book the page is in
     * @param req 
     * @param res 
     * @param next 
     */
    public static hasEditAccess(req:Request, res:Response, next:NextFunction):void {
        const pageId = req.params.id || req.body._id;
        Page.findById(pageId)
        .then(page => Book.findById(page.bookId))
        .then(book => {
            if (book.owner === req.user._id) return;
            if (book.editors.indexOf(req.user._id) !== -1) return;
            return Promise.reject(`User ${req.user._id} does not have edit rights to Book: ${book._id}`);
        })
        .then(() => next())
        .catch(Util.handleError(res))
    }

    /**
     * Updates a page, only the owner or editors of the assocated book can make updates
     * @param req 
     * @param res 
     */
    public static update(req:Request, res:Response):void {
        var myId:string = req.body._id;
        var myPage = new Page(req.body);
        delete req.body._id;

        myPage.validate()
        .then(() => Page.findByIdAndUpdate(myId, myPage))
        .then(() => pageSocket.onAddOrChange(myPage))
        .then(Util.handleResponseNoData(res))
        .catch(Util.handleError(res));
    }

    public static remove(req:Request, res:Response):void {
        var myId:string = req.params.id;
        //TODO: look through pages and widgets and remove first
        var myPage;
        Page.findById(myId)
        .then(page => {
            myPage = page;
            return page
        })
        .then(page => page.remove())
        // Page.findByIdAndRemove(myId)
        .then(() => {
            pageSocket.onDelete(myPage);
            return res.json();
        })
        .catch(Util.handleError(res));
    }

    public static index(req:Request, res:Response):void {
        Page.find({})
        .then(Util.handleResponse(res))
        .catch(Util.handleError(res));
    }
}