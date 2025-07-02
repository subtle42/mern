import axios from 'axios'

import { store } from '../store'
import BaseActions from '../baseActions'
import { ISource } from '@mern/server/api/source/model'
import { myWidgetActions } from '../widgets/actions'

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
        .then(() => myWidgetActions.runQueries(sourceId))
    }

    addMultipleFilters (sourceId: string, filters: {dimension: string, filter: number[]}[]): Promise<void> {
        return Promise.all(filters.map(filter => {
            return this.sendDispatch('addFilter', { ...filter, _id: sourceId })
        }))
        .then(() => myWidgetActions.runQueries(sourceId))
    }
}

export const mySourceActions = new SourceActions(store)

