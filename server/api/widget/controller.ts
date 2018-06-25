import {Request, Response, NextFunction} from "express";
import {Widget} from "./model";
import Utils from "../utils";
import Page from "../page/model";
import {Book} from "../book/model"
import {Source} from "../source/model"
import {pageSocket} from "../page/socket"
import {widgetSocket} from "./socket"
import {Layout} from "react-grid-layout"
import { IWidget, ISource } from "common/models";
import Util from "../utils";
import * as auth from "../../auth/auth.service"

const widgetLayout:Layout = {
    x: 1, y: 1, w: 1, h: 1
};

class WidgetController {
    create(req:Request, res:Response) {
        const {pageId, sourceId, type} = req.body;

        let myWidget = new Widget({
            pageId: pageId,
            sourceId: sourceId,
            type: type
        });

        Page.findById(pageId).exec()
        .then(page => Book.findById(page.bookId).exec())
        .then(book => auth.hasEditAccess(req.user._id, book))
        .then(() => Source.findById(sourceId))
        .then(mySource => this.addDefaultsToWidget(myWidget, mySource))
        .then(() => myWidget.validate())
        .then(() => Widget.create(myWidget))
        .then(widget => {
            return Page.findById(widget.pageId)
            .then(page => {
                page.layout.push(Object.assign({}, widgetLayout, {i:widget._id}));
                return page.update(page).exec()
                .then(() => widgetSocket.onAddOrChange(widget))
                .then(() => pageSocket.onAddOrChange(page));
            })
            .then(() => widget._id);
        })
        .then(Utils.handleResponse(res))
        .catch(Utils.handleError(res));
    }

    private addDefaultsToWidget(myWidget:IWidget, mySource:ISource):Promise<void> {
        return new Promise(resolve => {
            const dimensions = mySource.columns.filter(col => col.type === "group");
            const measures = mySource.columns.filter(col => col.type === "number");

            if (dimensions.length > 0) {
                myWidget.dimensions.push(dimensions[Math.floor(Math.random() * dimensions.length)].ref);
            }
            if (measures.length > 0) {
                myWidget.measures.push({
                    ref: measures[Math.floor(Math.random() * measures.length)].ref
                });
            }
            resolve();
        })
    }

    remove(req:Request, res:Response) {
        const id = req.params.id;

        Widget.findById(id).exec()
        .then(widget => {
            return Page.findById(widget.pageId)
            .then(page => {
                return Book.findById(page.bookId).exec()
                .then(book => auth.hasEditAccess(req.user._id, book))
                .then(() => {
                    page.layout = page.layout.filter(item => item.i !== id);
                    return page.update(page).exec()
                    .then(() => pageSocket.onAddOrChange(page))
                })
            })
            .then(() => Widget.findByIdAndRemove(id))
            .then(() => widgetSocket.onDelete(widget))
        })
        .then(Utils.handleResponseNoData(res))
        .catch(Utils.handleError(res))
    }

    update(req:Request, res:Response) {
        let myWidget = new Widget(req.body);
        const myId:string = req.body._id;
        delete req.body._id;

        myWidget.validate()
        .then(() => Page.findById(myWidget.pageId).exec())
        .then(page => Book.findById(page.bookId).exec())
        .then(book => auth.hasEditAccess(req.user._id, book))
        .then(() => Widget.findByIdAndUpdate(myId, req.body))
        .then(() => widgetSocket.onAddOrChange(myWidget))
        .then(Utils.handleResponseNoData(res))
        .catch(Utils.handleError(res));
    }

    get(req:Request, res:Response) {
        const myId:string = req.params.id;

        Widget.findById(myId)
        .then(widget => {
            return Page.findById(widget.pageId)
            .then(page => {
                return Book.findById(page.bookId)
                .then(book => auth.hasViewerAccess(req.user._id, book))
                .then(() => widget)
            })
        })
        .then(Utils.handleResponse(res))
        .catch(Utils.handleError(res))
    }
}

export const controller = new WidgetController();