import {factory, GenericStore} from "../baseReducer";
import {IBook} from "myModels";

export default class BookStore extends GenericStore {
    list:IBook[] = [];
    selected?:IBook;
}
