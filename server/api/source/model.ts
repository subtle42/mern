import {Schema, model} from "mongoose";
import {ISourceModel} from "../../dbModels";
import UserSocket from "../../sockets/userSocket";

var SourceSchema = new Schema({
    title: {type:String, required:true},
    location: {type:String, required:true},
    size: {type:Number, default: 0},
    rowCount: {type:Number, default: 0},
    columns: {type: [], default: []},
    owner: {type:String, required: true},
    editors: {type:[String], default:[]},
    viewers: {type:[String], default: []},
    isPublic: {type:Boolean, default: false}
});

export const Source = model<ISourceModel>('Source', SourceSchema);
export const SourceSocket = new UserSocket("source", SourceSchema, Source);