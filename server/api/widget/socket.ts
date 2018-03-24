import {IWidgetModel} from "../../dbModels";
import {Widget} from "./model";
import {Schema, Document} from "mongoose";
import BaseSocket from "../../sockets/sockets";

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

    onAddOrChange(model:IWidgetModel) {
        this._onAddOrChange(this.getParentId(model), [model]);
    }

    onDelete(model:IWidgetModel) {
        this._onDelete(this.getParentId(model), [model._id]);
    }
};

export const widgetSocket = new WidgetSocket();