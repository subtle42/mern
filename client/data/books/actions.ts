import axios from 'axios'
import { store } from '../store'
import { IBook } from '@mern/server/api/book/model'
import { joinRoom } from '../socket'
import { bookCmds } from './reducer'
import { myNotifActions } from '../notifications/actions'


export const selectBook = (id: string) => {
    store.dispatch(bookCmds.select(id))
    joinRoom('pages', id)
}

export const createBook = async(name: string) => {
    return runAction(axios.post<string>(`/api/books`, { name }))
    .then(res => res.data)
}

export const deleteBook = async(id: string) => {
    await runAction(axios.delete<void>(`/api/books/${id}`))
    .then(res => res.data)
}

export const updateBook = (book: IBook) => {
    return runAction(axios.put<void>(`/api/books`, book))
    .then(res => res.data)
}

const runAction = <T>(prom: Promise<T>) => {
    return prom.catch((err: Error) => {
        myNotifActions.error(err.message)
        return Promise.reject(err)
    })
}