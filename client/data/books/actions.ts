import axios from 'axios'
import { store } from '../store'
import BaseActions from '../baseActions'
import { IBook } from '@mern/server/api/book/model'
import { joinRoom } from '../socket'

class BookActions extends BaseActions {
    constructor (store) {
        super(store, 'books')
    }

    select (id: string) {
        return this._select(id)
        .then(() => joinRoom('pages', id))
    }

    create (input: string): Promise<string> {
        return axios.post(`/api/books`, {
            name: input
        })
        .then(res => res.data as string)
    }

    delete (book: IBook): Promise<void> {
        return axios.delete(`/api/books/${book._id}`)
        .then(res => res.data as undefined)
    }

    update (book: IBook): Promise<void> {
        return axios.put(`/api/books`, book)
        .then(res => res.data as undefined)
    }
}

export const myBookActions = new BookActions(store)
