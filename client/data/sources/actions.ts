import axios from 'axios'

import { store } from '../store'
import BaseActions from '../baseActions'
import widgetActions from 'data/widgets/actions'
import { ISource } from 'common/models'

class SourceActions extends BaseActions {
    constructor (store) {
        super(store, 'sources')
    }

    select (id: string) {
        console.warn(`Source select is not implemented`)
        return Promise.resolve()
    }

    create (file: File): Promise<string> {
        const data = new FormData()
        data.append('file', file)

        return axios.post(`/api/sources`, data)
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

    addFilter (sourceId: string, dimension: string, filter): Promise<void> {
        return this.sendDispatch('addFilter', {
            _id: sourceId,
            dimension,
            filter
        })
        .then(() => widgetActions.runQueries(sourceId))
    }
}

const sourceActions = new SourceActions(store)

export default sourceActions
