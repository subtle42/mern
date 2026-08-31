import { store } from '../store'
import axios from 'axios'
import { myDataActions } from '../data/actions'
import { widgetCmds } from './reducer'
import { IWidget } from '../../app/mySchemas'


export const createManyWidgets = async(sourceId: string, types: string[]) => {
    const res = await axios.post<void>('/api/widgets/multiple', {
        pageId: store.getState().pages.selected,
        sourceId,
        types
    })
    return res.data
}

export const createWidget = async(sourceId: string, type: string) => {
    const res = await axios.post<void>(`/api/widgets`, {
        pageId: store.getState().pages.selected,
        sourceId,
        type
    })
    return res.data
}

export const deleteWidget = async(id: string) => {
    const pageId = store.getState().pages.selected
    const bookId = store.getState().books.selected
    const res = await axios.delete<void>(`/api/widgets/${id}/${pageId}/${bookId}`)
    return res.data
}

export const updateWidget = async(widget: IWidget) => {
    const res = await axios.put<void>(`/api/widgets`, widget)
    return res.data
}

export const setWidgetSize = (id: string, width: number, height: number) => {
    store.dispatch(widgetCmds.setSize({
        id, size: { width, height }
    }));
}

const getFilter = (widget: IWidget): object => {
    const myFilters = store.getState().sources.filters[widget.sourceId]
    const toSend = {}

    if (!myFilters) return toSend

    Object.keys(myFilters).forEach(key => {
        if (widget.dimensions.find(d => d === key)) return
        toSend[key] = myFilters[key]
    })
    return toSend
}

export const queryWidget = async(widget: IWidget) => {
    return myDataActions.query(widget, getFilter(widget))
}

export const runWidgetQueries = async(sourceId: string) => {
    const calls = store.getState().widgets.list
        .filter(w => w.sourceId === sourceId)
        .map(w => queryWidget(w))

    return Promise.all(calls)
        .then(() => undefined)
        .catch(err => console.error(err))
}
