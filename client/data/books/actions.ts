import axios from 'axios'
import { store } from '../store'
import { IBook } from '@mern/server/api/book/model'
import { joinRoom } from '../socket'
import { bookCmds } from './reducer'


export const selectBook = (id: string) => {
    store.dispatch(bookCmds.select(id))
    joinRoom('pages', id)
}

export const createBook = (name: string) => {
    return axios.post<string>(`/api/books`, { name })
    .then(res => res.data)
}

export const deleteBook = (id: string) => {
    return axios.delete<void>(`/api/books/${id}`)
    .then(res => res.data)
}

export const updateBook = (book: IBook) => {
    return axios.put<void>(`/api/books`, book)
    .then(res => res.data)
}
