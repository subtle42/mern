import axios from 'axios'
import { store } from '../store'
import { joinRoom } from '../socket'
import { pageCmds } from './reducer'
import { IPage, IPageInput } from '../../app/mySchemas'


export const selectPage = (id: string) => {
    store.dispatch(pageCmds.select(id))
    joinRoom('widgets', id)
}

export const createPage = async(input: IPageInput) => {
    const res = await axios.post<string>(`/api/pages`, input)
    return res.data
}

export const deletePage = async(id: string) => {
    const res = await axios.delete(`/api/pages/${id}`)
    return res.data
}

export const updatePage = async(page: IPage) => {
    const res = await axios.put(`/api/pages`, page)
    return res.data
}

