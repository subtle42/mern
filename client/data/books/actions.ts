import axios, {AxiosPromise} from "axios";
import {IBook} from "myModels";
import store from "../store";
import BaseActions from "../baseActions";
import pageActions from "../pages/actions";

class BookActions extends BaseActions{
    constructor(store) {
        super(store, "books");
    }

    select(book:IBook) {
        return this._select(book)
        .then(() => pageActions.joinRoom(book._id));
    }

    create(input:string):Promise<string> {
        return axios.post(`/api/books`, {
            name:input
        })
        .then(res => res.data as string);
    }

    delete(book:IBook):Promise<void> {
        return axios.delete(`/api/books/${book._id}`)
        .then(res => res.data as undefined);
    }
    update(book:IBook):Promise<void> {
        return axios.put(`/api/books`, book)
        .then(res => res.data as undefined);
    }
}

const myBookActions = new BookActions(store);

export default myBookActions; 