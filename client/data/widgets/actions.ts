import { store } from '../store'
import BaseActions from '../baseActions'
import axios from 'axios'
import { ISource, IWidget, IQuery } from 'common/models'

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
        const query: IQuery = {
            sourceId: widget.sourceId,
            measures: widget.measures,
            dimensions: widget.dimensions,
            filters: []
        }
        return axios.post(`/api/sources/query`, query)
        .then(res => console.log(res.data))
    }
}

const widgetActions = new WidgetActions(store)

export default widgetActions
