import {Layout} from "react-grid-layout"

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

export type ColumnType = "number" | "group" | "text" | "datetime";

export interface ISourceColumn {
    name: string;
    ref: string;
    type: ColumnType;
}

export interface IUser {
    _id:any;
    name:string
}