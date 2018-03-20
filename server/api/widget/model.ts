import {Schema, model} from "mongoose";
import {IWidgetModel} from "../../dbModels";
// import PageSocket from "./socket";

var WidgetSchema = new Schema({
    pageId: {type: String, required:true},
    sourceId: {type:String, required:true},
    groups: {type:Array, required:true, default: []},
    series: {type:Array, required:true, default: []}
});

// const mySocket = new PageSocket(PageSchema);
export default model<IWidgetModel>("Widget", WidgetSchema);