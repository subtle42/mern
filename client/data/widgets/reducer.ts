import { AnyAction } from 'redux'
import WidgetStore from './model'
import { factory } from '../baseReducer'

let myFactory = Object.assign({}, factory, {
    setSize: (store: WidgetStore, payload: any): WidgetStore => {
        store.sizes = { ...store.sizes }
        store.sizes[payload.id] = payload.size
        return store
    },
    setData: (store: WidgetStore, payload: any): WidgetStore => {
        store = { ...store }
        store.data = { ...store.data }
        store.data[payload._id] = payload.data
        return store
    }
})

const possibleActions: string[] = Object.keys(myFactory)

export default (state: WidgetStore= new WidgetStore(), action: AnyAction): WidgetStore => {
    if (action.namespace !== 'widgets') return state
    if (possibleActions.indexOf(action.type) === -1) return state
    return myFactory[action.type](state, action.payload)
}
