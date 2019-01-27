import { AnyAction } from 'redux'
import { factory } from '../baseReducer'
import OfferStore from './model'

const possibleActions: string[] = Object.keys(factory)

export default (state: OfferStore= new OfferStore(), action: AnyAction): OfferStore => {
    if (action.namespace !== 'offer') return state
    if (possibleActions.indexOf(action.type) === -1) return state
    return factory[action.type](state, action.payload)
}