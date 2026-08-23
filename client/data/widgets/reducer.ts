import { IWidget } from '../../app/mySchemas'
import { factory, GenericStore } from '../baseReducer'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
// import { IWidget } from '@mern/server/api/widget/model'


class WidgetStore extends GenericStore {
    list: IWidget[] = []
    sizes: {} = {}
    data: {[key: string]: any[]} = {}
}

export const WidgetSlice = createSlice({
    name: 'widgets',
    initialState: new WidgetStore(),
    reducers: {
        ...factory,
        setSize: (store, {payload}: PayloadAction<any>) => {
        store.sizes = { ...store.sizes }
            store.sizes[payload.id] = payload.size
            return store
        },
        setData: (store, {payload}: PayloadAction<any>) => {
            store = { ...store }
            store.data = { ...store.data }
            store.data[payload._id] = payload.data
            return store
        }
    }
})

export const widgetCmds = WidgetSlice.actions