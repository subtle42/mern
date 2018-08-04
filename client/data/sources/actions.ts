import store from '../store'
import BaseActions from '../baseActions'
import axios from 'axios'
import { ISource } from 'common/models'

class SourceActions extends BaseActions {
    constructor (store) {
        super(store, 'sources')
    }

    select (source: ISource) {
        return this._select(source)
    }

    create (file: File): Promise<string> {
        let data = new FormData()
        data.append('file', file)

        return axios.post(`/api/sources`, data, {
            // headers: {
            //     'Content-Type': 'multipart/form-data'
            // }
        })
        .then(res => res.data)
    }
    delete (sourceId: string): Promise<void> {
        return axios.delete(`/api/sources/${sourceId}`)
        .then(res => res.data as undefined)
    }

    update (source: ISource): Promise<void> {
        return axios.put(`/api/sources`, source)
        .then(res => res.data as undefined)
    }
}

const sourceActions = new SourceActions(store)

export default sourceActions
