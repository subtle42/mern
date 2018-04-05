import {Request, Response} from "express";
import {Widget} from "./model";
import Utils from "../utils";
import Page from "../page/model";
import {pageSocket} from "../page/socket"
import {widgetSocket} from "./socket"
import {Layout} from "react-grid-layout"

const widgetLayout:Layout = {
    x: 1, y: 1, w: 1, h: 1
};

export default class WidgetController {
    static create(req:Request, res:Response) {
        let myWidget = new Widget({
            pageId: req.body.pageId,
            sourceId: "test"
        });

        myWidget.validate()
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

    static remove(req:Request, res:Response) {
        const id = req.params.id;

        Widget.findById(id).exec()
        .then(widget => {
            return Page.findById(widget.pageId)
            .then(page => {
                page.layout = page.layout.filter(item => item.i !== id);
                return page.update(page).exec()
                .then(() => pageSocket.onAddOrChange(page))
            })
            .then(() => Widget.findByIdAndRemove(id))
            .then(() => widgetSocket.onDelete(widget))
        })
        .then(Utils.handleResponseNoData(res))
        .catch(Utils.handleError(res))

        // Widget.findByIdAndRemove(id).exec()
        // .then(Utils.handleResponseNoData(res))
        // .catch(Utils.handleError(res))
    }

    static update(req:Request, res:Response) {
        let myWidget = new Widget(req.body);
        const myId:string = req.body._id;
        delete req.body._id;

        myWidget.validate()
        .then(() => Widget.findByIdAndUpdate(myId, req.body))
        .then(Utils.handleNoResult(res))
        .then(Utils.handleResponseNoData(res))
        .catch(Utils.handleError(res));
    }
}