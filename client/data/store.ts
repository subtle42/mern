import { createStore, applyMiddleware, combineReducers, Store } from 'redux'
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
import { NotificationStore, notifReducer } from './notifications/reducer'

export interface StoreModel {
    books: booksModel,
    pages: pagesModel,
    widgets: widgetsModel,
    auth: authModel,
    sources: sourcesModel
    notifcations: NotificationStore
}

const reducers = combineReducers({
    books,
    pages,
    widgets,
    auth,
    sources,
    notifications: notifReducer
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
