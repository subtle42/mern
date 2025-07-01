import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export class DataModel {
    results: {[key: string]: any[]} = {}
}

export const DataSlice = createSlice({
    name: 'data',
    initialState: {} as DataModel,
    reducers: {
        setData: (store, {payload}: PayloadAction<any>) => {
            store = { ...store }
            store.results[payload._id] = payload.data
            return store
        }
    }
})
