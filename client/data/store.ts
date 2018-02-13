import {createStore, applyMiddleware, combineReducers, Store} from "redux";
import thunk from "redux-thunk";
import * as promiseMiddleware from "redux-promise"

import books from "./books/reducer";
import pages from "./pages/reducer";
import widgets from "./widgets/reducer";
import auth from "./auth/reducer";
import booksModel from "./books/model";
import pagesModel from "./pages/model";
// import widget from "./widgets/model";
import authModel from "./auth/model";

interface myStore {
    books:booksModel,
    pages:pagesModel,
    // widget,
    auth:authModel
}

const reducers = combineReducers({
    books,
    pages,
    // widgets,
    auth,
});

const middleware = applyMiddleware(promiseMiddleware);

const store:Store<myStore> = createStore(reducers, middleware) as Store<myStore>;
var tmp:any = window;
tmp.store = store;

export default store;