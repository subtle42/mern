import {Request, Response, NextFunction} from "express";
import Page from "./model";
import {Book} from "../book/model"
import Util from "../utils";
import {pageSocket} from "./socket";
import * as auth from "../../auth/auth.service"
import { Widget } from "../widget/model";

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
        .then(() => Book.findById(myPage.bookId))
        .then(book => auth.hasEditAccess(req.user._id, book))
        .then(() => Page.create(myPage))
        .then(page => {
            pageSocket.onAddOrChange(page);
            return page._id;
        })
        .then(Util.handleResponse(res))
        .catch(Util.handleError(res));
    }

    /**
     * Updates a page if user has edit access
     * @param req 
     * @param res 
     */
    public static update(req:Request, res:Response):void {
        var myId:string = req.body._id;
        var myPage = new Page(req.body);
        delete req.body._id;

        myPage.validate()
        .then(() => Page.findById(myId))
        .then(page => {
            return Book.findById(page.bookId)
            .then(book => auth.hasEditAccess(req.user._id, book))
            .then(() => Page.findByIdAndUpdate(myId, myPage))
        })
        .then(() => pageSocket.onAddOrChange(myPage))
        .then(Util.handleResponseNoData(res))
        .catch(Util.handleError(res));
    }

    /**
     * Removes a page if user has book edit access
     * @param req
     * @param res 
     */
    public static remove(req:Request, res:Response):void {
        var myId:string = req.params.id;

        Page.findById(myId)
        .then(page => {
            return Book.findById(page.bookId)
            .then(book => auth.hasEditAccess(req.user._id, book))
            .then(() => Widget.remove({
                pageId:myId
            }))
            .then(() => page.remove())
            .then(() => pageSocket.onDelete(page))
        })
        .then(Util.handleResponseNoData(res))
        .catch(Util.handleError(res));
    }

    public static getPages(req:Request, res:Response):void {
        const bookId:string = req.params.id;
        Book.findById(bookId)
        .then(book => auth.hasViewerAccess(req.user._id, book))
        .then(() => Page.find({bookId}))
        .then(Util.handleResponse(res))
        .catch(Util.handleError(res));
    }
}