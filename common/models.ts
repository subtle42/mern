export interface IUser {
    _id:any;
    name:string;
    email:string;
    password?:string;
}

export interface IBook {
    _id:any;
    name:string;
    owner:string;
    edit:string[];
    view:string[];
    isPublic:boolean;
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

export interface ISource {
    _id:any;
    name:string;
    owner:string;
    edit:string[];
    view:string[];
    isPublic:boolean;
}

export interface IUser {
    _id:any;
    name:string
}