import { IBook } from '@mern/server/api/book/model'
import { factory, GenericStore } from '../baseReducer'
import { createSlice } from '@reduxjs/toolkit'


class BookStore extends GenericStore {
    list: IBook[] = []
    selected?: string
}

export const BookSlice = createSlice({
    name: 'books',
    initialState: new BookStore(),
    reducers: factory
})

export const bookCmds = BookSlice.actions
