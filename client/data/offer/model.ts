
import { GenericStore } from '../baseReducer'
import { IOffer } from 'common/models'

export default class OfferStore extends GenericStore {
    list: IOffer[] = []
    selected?: string
}