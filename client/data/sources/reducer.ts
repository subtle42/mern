import { factory, GenericStore } from '../baseReducer'
import { ISource } from 'common/models'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export class SourceStore implements GenericStore {
    list: ISource[] = []
    filters: {[key: string]: {}} = {}
}

interface SourcePayload {
    _id: string,
    dimension: string,
    filter: any[]
}

export const SourceSlice = createSlice({
    name: 'sources',
    initialState: new SourceStore(),
    reducers: {
        ...factory,
        addFilter: (state, {payload}: PayloadAction<SourcePayload>) => {
            state = { ...state }
            if (!state.filters[payload._id]) {
                state.filters[payload._id] = {}
            } else {
                state.filters[payload._id] = { ...state.filters[payload._id] }
            }
            if (payload.filter.length === 0) {
                delete state.filters[payload._id][payload.dimension]
            } else {
                state.filters[payload._id][payload.dimension] = payload.filter
            }
            return state
        },
        disconnect: (state) => {
            return new SourceStore()
        }
    }
})
