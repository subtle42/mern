import { combineSlices, configureStore, PayloadAction, Tuple } from '@reduxjs/toolkit'
import promiseMiddleware from 'redux-promise'


import { BookSlice } from './books/reducer'
import { PageSlice } from './pages/reducer'
import { WidgetSlice } from './widgets/reducer'
import { AuthSlice }  from './auth/reducer'
import { SourceSlice } from './sources/reducer'
import { DataSlice } from './data/reducer'
import { NotifSlice } from './notifications/reducer'


const allSlices = combineSlices(
    BookSlice,
    PageSlice,
    WidgetSlice,
    AuthSlice,
    SourceSlice,
    NotifSlice,
    DataSlice
)

// Should reset the store
// const rootReducer = (state: any, action: PayloadAction<void>) => {
//     if (action.type === 'RESET') {
//         state = undefined
//     }
//     return allSlices(state, action)
// }

export const store = configureStore({
    reducer: allSlices,
    middleware: () => new Tuple(promiseMiddleware as any)
})
