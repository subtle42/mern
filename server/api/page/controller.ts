import {Request, Response} from "express";
import Page from "./model";
import Util from "../utils";
import {pageSocket} from "./socket";

export default class PageController {
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

    public static update(req:Request, res:Response):void {
        var myId:string = req.body._id;
        var myPage = new Page(req.body);
        delete req.body._id;

        myPage.validate()
        .then(() => Page.findByIdAndUpdate(myId, req.body))
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