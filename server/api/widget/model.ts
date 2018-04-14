import {Schema, model} from "mongoose";
import {IWidgetModel} from "../../dbModels";

var WidgetSchema = new Schema({
    pageId: {type: String, required:true},
    sourceId: {type:String, required:true},
    margins: {
        top:{type:Number, required:true, default: 10},
        bottom:{type:Number, required:true, default: 10},
        left:{type:Number, required:true, default: 10},
        right:{type:Number, required:true, default: 10},
    },
    groups: {type:Array, required:true, default: []},
    series: {type:Array, required:true, default: []}
});

export const Widget =  model<IWidgetModel>("Widget", WidgetSchema);