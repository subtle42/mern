import Page from "./model";
import {Schema, Document} from "mongoose";
import BaseSocket from "../../sockets/sockets";

export default class PageSocket extends BaseSocket {
    constructor(schema:Schema) {
        super("pages", schema);
    }

    getParentId(model) {
        return model.bookId
    }

    getInitialState(bookId:string) {
        return Page.find({
            bookId
        }).exec();
    }
};