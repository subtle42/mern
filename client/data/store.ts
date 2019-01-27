import { createStore, applyMiddleware, combineReducers, Store } from 'redux'
import * as promiseMiddleware from 'redux-promise'


import auth from './auth/reducer'
import authModel from './auth/model'
import offer from './offer/reducer'
import offerModel from './offer/model'
import { NotificationStore, notifReducer } from './notifications/reducer'

export interface StoreModel {
    auth: authModel,
    offer: offerModel
    notifcations: NotificationStore
}

const reducers = combineReducers({
    auth,
    offer,
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
