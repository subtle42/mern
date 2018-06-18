import {IWidgetModel} from "../../dbModels";
import {Widget} from "./model";
import {Schema, Document} from "mongoose";
import BaseSocket from "../../sockets/sockets";
import {Book} from "../book/model"
import Page from "../page/model"

class WidgetSocket extends BaseSocket {
    constructor() {
        super("widgets");
    }

    getParentId(model:IWidgetModel) {
        return model.pageId;
    }

    getInitialState(pageId:string) {
        return Widget.find({
            pageId
        }).exec();
    }

    getSharedModel(pageId:string) {
        return Page.findById(pageId).exec()
        .then(page => Book.findById(page.bookId).exec())
    }

    onAddOrChange(model:IWidgetModel) {
        this._onAddOrChange(this.getParentId(model), [model]);
    }

    onDelete(model:IWidgetModel) {
        this._onDelete(this.getParentId(model), [model._id]);
    }
};

export const widgetSocket = new WidgetSocket();