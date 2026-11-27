import axios from 'axios'

import { store } from '../store'
import { ISource } from '@mern/server/api/source/model'
import { runWidgetQueries } from '../widgets/actions'
import { SourceSlice } from './reducer'


export const selectSource = (id: string) => {
    console.warn(`Source select is not implemented`)
    return Promise.resolve()
}

export const createSource = (file: File): Promise<string> => {
    const data = new FormData()
    data.append('file', file)

    return axios.post(`/api/sources`, data)
    .then(res => res.data)
}

export const deleteSource = (sourceId: string): Promise<void> => {
    return axios.delete(`/api/sources/${sourceId}`)
    .then(res => res.data as undefined)
}

export const updateSource = (source: ISource): Promise<void> => {
    return axios.put(`/api/sources`, source)
    .then(res => res.data as undefined)
}

export const addSourceFilter = (sourceId: string, dimension: string, filter): Promise<void> => {
    store.dispatch(
        SourceSlice.actions.addFilter({
            _id: sourceId,
            dimension,
            filter
        })
    )
    return runWidgetQueries(sourceId)
}

export const addMultipleSourceFilters = (sourceId: string, filters: {dimension: string, filter: number[]}[]): Promise<void> => {
    filters.forEach(f => store.dispatch(
        SourceSlice.actions.addFilter({_id: sourceId, ...f})
    ))
    return runWidgetQueries(sourceId)
}

