import axios from 'axios'
import { store } from '../store'
import BaseActions from '../baseActions'
import { IPage } from '@mern/server/api/page/model'
import { myWidgetActions } from '../widgets/actions'

class PageActions extends BaseActions {
    constructor (store) {
        super(store, 'pages')
    }

    select (id: string) {
        return this._select(id)
        .then(() => myWidgetActions.joinRoom(id))
    }

    create (input: string): Promise<string> {
        return axios.post(`/api/pages`, {
            name: input,
            bookId: this.store.getState().books.selected
        })
        .then(res => res.data as string)
    }

    delete (page: string): Promise<void> {
        return axios.delete(`/api/pages/${page}`)
        .then(res => res.data as undefined)
    }

    update (page: IPage): Promise<void> {
        return axios.put(`/api/pages`, page)
        .then(res => res.data as undefined)
    }
}

const myPageActions = new PageActions(store)

export default myPageActions
