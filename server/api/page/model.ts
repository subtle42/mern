import * as mongoose from "mongoose";
import {IPageModel} from "../../dbModels";
import PageSocket from "./socket";

var PageSchema = new mongoose.Schema({
    name: {type: String, required: true},
    bookId: {type: String, required:true},
    // widgets: {type: [String], default: [], required: true},
    // owner: {type: String, required: true},
    // editors: {type: [String], default: [], required: true},
    // viewers: {type: [String], default: [], required: true}
});

const mySocket = new PageSocket(PageSchema);
export default mongoose.model<IPageModel>("Page", PageSchema);