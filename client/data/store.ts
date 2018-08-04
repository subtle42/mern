import { createStore, applyMiddleware, combineReducers, Store } from 'redux'
import thunk from 'redux-thunk'
import * as promiseMiddleware from 'redux-promise'

import books from './books/reducer'
import pages from './pages/reducer'
import widgets from './widgets/reducer'
import auth from './auth/reducer'
import sources from './sources/reducer'
import booksModel from './books/model'
import pagesModel from './pages/model'
import sourcesModel from './sources/model'
import widgetsModel from './widgets/model'
import authModel from './auth/model'

interface MyStore {
    books: booksModel,
    pages: pagesModel,
    widgets: widgetsModel,
    auth: authModel,
    sources: sourcesModel
}

const reducers = combineReducers({
    books,
    pages,
    widgets,
    auth,
    sources
})

const middleware = applyMiddleware(promiseMiddleware)

const store: Store<MyStore> = createStore(reducers, middleware) as Store<MyStore>
let tmp: any = window
tmp.store = store

export default store
