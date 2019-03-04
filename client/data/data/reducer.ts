import { AnyAction } from 'redux'

export class DataModel {
    results: {[key: string]: any[]} = {}
}

let myFactory = {
    setData: (store: DataModel, payload: any): DataModel => {
        store = { ...store }
        store.results[payload._id] = payload.data
        return store
    }
}

const possibleActions: string[] = Object.keys(myFactory)

export const DataReducer = (state: DataModel= new DataModel(), action: AnyAction): DataModel => {
    if (action.namespace !== 'data') return state
    if (possibleActions.indexOf(action.type) === -1) return state
    return myFactory[action.type](state, action.payload)
}
