
import { GenericStore } from '../baseReducer'
import { IOffer } from 'common/models'

export default class BookStore extends GenericStore {
    list: IOffer[] = []
    selected?: string
}