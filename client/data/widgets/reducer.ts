import { AnyAction } from 'redux'
import WidgetStore from './model'
import { factory } from '../baseReducer'

let myFactory = Object.assign({}, factory, {
    setSize: (store: WidgetStore, payload: any): WidgetStore => {
        store.sizes[payload.id] = payload.size
        return store
    }
})

const possibleActions: string[] = Object.keys(myFactory)

export default (state: WidgetStore= new WidgetStore(), action: AnyAction): WidgetStore => {
    if (action.namespace !== 'widgets') return state
    if (possibleActions.indexOf(action.type) === -1) return state
    return myFactory[action.type](state, action.payload)
}
