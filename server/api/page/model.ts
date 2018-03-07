import {model, Schema} from "mongoose";
import {IPageModel} from "../../dbModels";
import PageSocket from "./socket";

var PageSchema = new Schema({
    bookId: {type: String, required:true},
    name: {type: String, required: true},
    isDraggable: {type: Boolean, required: true, default: true},
    isResizable: {type: Boolean, required: true, default: true},
    isRearrangeable: {type: Boolean, required: true, default: true},
    preventCollision: {type: Boolean, required: true, default: true},
    margin: {
        type: [{type: Number}],
        validate: [(val:number[]) => {
            return val.length === 2;
        }, "Margins must be an array of 2."],
        default: [10, 10],
        required: true
    },
    containerPadding:{
        type: [{type: Number}],
        validate: [(val:number[]) => {
            return val.length === 2;
        }, "Conatiner padding must be an array of 2."],
        default: [0,0],
        required: true
    },
    cols: {type: Number, min: 1, max: 12, default: 12, required:true},
    layout: {type: Array, default: [], required: true}
});

const mySocket = new PageSocket(PageSchema);
export default model<IPageModel>("Page", PageSchema);