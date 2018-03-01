import {Schema, model} from "mongoose";
import {IPageModel} from "../../dbModels";
// import PageSocket from "./socket";

var WidgetSchema = new Schema({
    pageId: {type: String, required:true},
    sourceId: {type:String, required:true},
    groups: [],
    series: []
});

// const mySocket = new PageSocket(PageSchema);
export default model<IPageModel>("Widget", WidgetSchema);