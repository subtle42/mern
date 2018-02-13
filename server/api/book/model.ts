import * as mongoose from "mongoose";
import {IBookModel} from "../../dbModels";
import BookSocket from "./socket";

const BookSchema = new mongoose.Schema({
    name: {type: String, required: true},
    pages: [{type: String, required: true}],
    owner: {type: String, required: true},
    editors: [{type: String, required: true}],
    viewers: [{type: String, required: true}],
    isPublic: {type: Boolean, required:true, default:false}
});

export const bookSocket = new BookSocket(BookSchema);
export const Book = mongoose.model<IBookModel>("Book", BookSchema);