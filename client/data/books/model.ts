import { GenericStore } from '../baseReducer'
import { IBook } from 'common/models'

export default class BookStore extends GenericStore {
    list: IBook[] = []
    selected?: string
}
