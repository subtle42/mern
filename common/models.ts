import {Layout} from "react-grid-layout"
import {ColumnType} from "./constants";

export type ColumnType = "number" | "group" | "text" | "datetime";  

export interface IUser {
    _id:any;
    name:string;
    email:string;
    password?:string;
}

export interface IBook extends IShared {
    _id:any;
    name:string;
}

export interface IFilter {
    ref:string;
    range?:[number, number];
    option?:string[]
}

export interface IQuery {
    sourceId:string;
    measures:[{ref:string}];
    dimensions:string[];
    filters:IFilter[];
}

export interface IPage {
    _id:any;
    bookId:string;
    name:string;
    isDraggable:boolean;
    isResizable:boolean;
    isRearrangeable:boolean;
    preventCollision:boolean;
    margin:[number, number];
    containerPadding:[number, number];
    cols:number;
    layout:Layout[]
}

export interface IWidget {
    _id:any;
    pageId:string;
    sourceId:string;
    margins: {
        top:number,
        bottom:number,
        left:number,
        right:number
    },
    type:string;
    measures:[{ref:string}];
    dimensions:string[];
}

export interface ISource extends IShared{
    _id:any;
    title: string;
    location: string;
    size: number;
    rowCount: number;
    columns: ISourceColumn[];
}

export interface IShared {
    owner: string;
    editors: string[];
    viewers: string[];
    isPublic: boolean;
}


export interface ISourceColumn {
    name: string;
    ref: string;
    type: ColumnType;
}

export interface IUser {
    _id:any;
    name:string
}