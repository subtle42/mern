import { factory } from '../baseReducer'
import PageStore from './model'
import { createSlice } from '@reduxjs/toolkit'


export const PageSlice = createSlice({
    name: 'pages',
    initialState: new PageStore(),
    reducers: factory
})

export const pageCmds = PageSlice.actions