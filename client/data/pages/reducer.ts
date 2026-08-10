import { IPage } from '@mern/server/api/page/model'
import { factory, GenericStore } from '../baseReducer'
import { createSlice } from '@reduxjs/toolkit'

class PageStore extends GenericStore {
    list: IPage[] = []
    selected?: string
}

export const PageSlice = createSlice({
    name: 'pages',
    initialState: new PageStore(),
    reducers: factory
})

export const pageCmds = PageSlice.actions