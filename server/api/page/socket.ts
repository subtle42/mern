import {IPageModel} from "../../dbModels";
import Page from "./model";
import {Schema, Document} from "mongoose";
import BaseSocket from "../../sockets/sockets";

export class PageSocket extends BaseSocket {
    constructor() {
        super("pages");
    }

    getParentId(model:IPageModel) {
        return model.bookId
    }

    getInitialState(bookId:string) {
        return Page.find({
            bookId
        }).exec();
    }

    onAddOrChange(model:IPageModel) {
        this._onAddOrChange(this.getParentId(model), [model]);
    }

    onDelete(model:IPageModel) {
        this._onDelete(this.getParentId(model), [model._id]);
    }
};