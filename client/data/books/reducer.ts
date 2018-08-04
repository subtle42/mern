import { AnyAction } from 'redux'
import { factory } from '../baseReducer'
import BookStore from './model'

const possibleActions: string[] = Object.keys(factory)

export default (state: BookStore= new BookStore(), action: AnyAction): BookStore => {
    if (action.namespace !== 'books') return state
    if (possibleActions.indexOf(action.type) === -1) return state
    return factory[action.type](state, action.payload)
}
