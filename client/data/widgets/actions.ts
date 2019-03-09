import { store } from '../store'
import BaseActions from '../baseActions'
import axios from 'axios'
import { ISource, IWidget, IQuery } from 'common/models'
import DataActions from '../data/actions'

class WidgetActions extends BaseActions {
    constructor (store) {
        super(store, 'widgets')
    }

    select () {
        console.warn('This does nothing')
        return null
    }

    create (config: {source: ISource, type: string}): Promise<void> {
        return axios.post(`/api/widgets`, {
            pageId: store.getState().pages.selected,
            sourceId: config.source._id,
            type: config.type
        })
        .then(res => undefined)
    }
    delete (id: string): Promise<void> {
        return axios.delete(`/api/widgets/${id}`)
        .then(res => res.data as undefined)
    }
    update (widget: IWidget): Promise<void> {
        return axios.put(`/api/widgets`, widget)
        .then(res => res.data as undefined)
    }
    setSize (id: string, width: number, height: number): void {
        this.sendDispatch('setSize', { id: id, size: { width, height } })
    }
    query (widget: IWidget): Promise<void> {
        return DataActions.query(widget, this.getFilter(widget))
    }

    private getFilter (widget: IWidget): object {
        const myFilters = store.getState().sources.filters[widget.sourceId]
        const toSend = {}

        if (!myFilters) return toSend

        Object.keys(myFilters).forEach(key => {
            if (widget.dimensions.find(d => d === key)) return
            toSend[key] = myFilters[key]
        })
        return toSend
    }

    runQueries (sourceId: string) {
        const calls = store.getState().widgets.list
        .filter(w => w.sourceId === sourceId)
        .map(w => this.query(w))

        return Promise.all(calls)
        .then(() => console.log('done'))
        .catch(err => console.error(err))
    }
}

const widgetActions = new WidgetActions(store)

export default widgetActions
