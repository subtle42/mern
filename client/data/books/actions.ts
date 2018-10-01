import axios from 'axios'
import { IBook } from 'common/models'
import { store } from '../store'
import BaseActions from '../baseActions'
import pageActions from '../pages/actions'

class BookActions extends BaseActions {
    constructor (store) {
        super(store, 'books')
    }

    select (id: string) {
        return this._select(id)
        .then(() => pageActions.joinRoom(id))
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

const myBookActions = new BookActions(store)

export default myBookActions
