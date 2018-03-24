import {Schema, model} from "mongoose";
import {IWidgetModel} from "../../dbModels";

var WidgetSchema = new Schema({
    pageId: {type: String, required:true},
    sourceId: {type:String, required:true},
    groups: {type:Array, required:true, default: []},
    series: {type:Array, required:true, default: []}
});

export const Widget =  model<IWidgetModel>("Widget", WidgetSchema);