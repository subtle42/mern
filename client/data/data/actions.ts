import { store } from '../store'
import axios from 'axios'
import { IWidget, IQuery } from 'common/models'

class DataActions {
    private nameSpace = 'data'
    private myStore: any = store
    private lastQuery = {}

    sendDispatch (type, payload) {
        this.myStore.dispatch(new Promise((resolve) => {
            resolve({
                type,
                payload,
                namespace: this.nameSpace
            })
        }))
    }

    query (widget: IWidget): Promise<void> {
        const query: IQuery = {
            sourceId: widget.sourceId,
            measures: widget.measures,
            dimensions: widget.dimensions,
            filters: []
        }
        const test = JSON.stringify(query)

        if (this.lastQuery[widget._id] === test) {
            return Promise.resolve()
        }
        this.lastQuery[widget._id] = test

        return axios.post(`/api/sources/query`, query)
        .then(res => this.sendDispatch('setData', {
            _id: widget._id,
            data: res.data
        }))
    }
}

export default new DataActions()
