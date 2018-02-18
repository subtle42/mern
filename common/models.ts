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
    // owner:string;
    // edit:string[];
    // view:string[];
    // isPublic:boolean;
}

export interface IWidget {
    _id:any;
    pageId:string;
    sourceId:string;
}

export interface ISource extends IShared{
    _id:any;
    name: string;
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