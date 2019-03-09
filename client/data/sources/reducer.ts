import { AnyAction } from 'redux'
import { factory, GenericStore } from '../baseReducer'
import { ISource } from 'common/models'

export class SourceStore implements GenericStore {
    list: ISource[] = []
    filters: {[key: string]: {}} = {}
}

interface Payload {
    _id: string,
    dimension: string,
    filter: any[]
}

const myFactory = Object.assign({}, factory, {
    addFilter: (store: SourceStore, payload: Payload): SourceStore => {
        store = { ...store }
        if (!store.filters[payload._id]) {
            store.filters[payload._id] = {}
        } else {
            store.filters[payload._id] = { ...store.filters[payload._id] }
        }
        if (payload.filter.length === 0) {
            delete store.filters[payload._id][payload.dimension]
        } else {
            store.filters[payload._id][payload.dimension] = payload.filter
        }
        return store
    }
})

const possibleActions: string[] = Object.keys(myFactory)

export const SourceReducer = (state: SourceStore= new SourceStore(), action: AnyAction): SourceStore => {
    if (action.namespace !== 'sources') return state
    if (possibleActions.indexOf(action.type) === -1) return state
    return myFactory[action.type](state, action.payload)
}
