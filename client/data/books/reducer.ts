import { factory } from '../baseReducer'
import BookStore from './model'
import { createSlice } from '@reduxjs/toolkit'


export const BookSlice = createSlice({
    name: 'books',
    initialState: new BookStore(),
    reducers: factory
})

export const bookCmds = BookSlice.actions
