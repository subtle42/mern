import { createStore, applyMiddleware, combineReducers, Store } from 'redux'
import promiseMiddleware from 'redux-promise'

import books from './books/reducer'
import pages from './pages/reducer'
import widgets from './widgets/reducer'
import auth from './auth/reducer'
import booksModel from './books/model'
import pagesModel from './pages/model'
import { SourceReducer, SourceStore } from './sources/reducer'
import widgetsModel from './widgets/model'
import authModel from './auth/model'
import { DataModel, DataReducer } from './data/reducer'
import { NotificationStore, notifReducer } from './notifications/reducer'

export interface StoreModel {
    books: booksModel,
    pages: pagesModel,
    widgets: widgetsModel,
    auth: authModel,
    sources: SourceStore
    notifcations: NotificationStore,
    data: DataModel
}



const reducers = combineReducers({
    books,
    pages,
    widgets,
    auth,
    sources: SourceReducer,
    notifications: notifReducer,
    data: DataReducer
})

// Should reset the store
const rootReducer = (state, action) => {
    if (action.type === 'RESET') {
        state = undefined
    }
    return reducers(state, action)
}

const middleware = applyMiddleware(promiseMiddleware)
export const store: Store<StoreModel> = createStore(rootReducer, middleware)
