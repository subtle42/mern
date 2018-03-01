import {model, Schema} from "mongoose";
import {IPageModel} from "../../dbModels";
import PageSocket from "./socket";

var PageSchema = new Schema({
    name: {type: String, required: true},
    bookId: {type: String, required:true},
    // widgets: {type: [String], default: [], required: true},
    // owner: {type: String, required: true},
    // editors: {type: [String], default: [], required: true},
    // viewers: {type: [String], default: [], required: true}
});

const mySocket = new PageSocket(PageSchema);
export default model<IPageModel>("Page", PageSchema);