import {IUser} from "myModels";

export default class AuthStore {
    token?:string;
    me?:IUser;
}
