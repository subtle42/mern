import {Request, Response} from "express";
import Widget from "./model";
import Utils from "../utils";

export default class WidgetController {
    static create(req:Request, res:Response) {
        
    }

    static remove(req:Request, res:Response) {
        const id = req.params.id;
        Widget.findByIdAndRemove(id).exec()
        .then(Utils.handleResponseNoData(res))
        .catch(Utils.handleError(res))
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