import {model, Schema} from "mongoose";
import {IBookModel} from "../../dbModels";
import BookSocket from "./socket";

const BookSchema = new Schema({
    name: {type: String, required: true},
    pages: [{type: String, required: true}],
    owner: {type: String, required: true},
    editors: [{type: String, required: true}],
    viewers: [{type: String, required: true}],
    isPublic: {type: Boolean, required:true, default:false}
});

export const bookSocket = new BookSocket(BookSchema);
export const Book = model<IBookModel>("Book", BookSchema);