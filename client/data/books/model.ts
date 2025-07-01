import { IBook } from '@mern/server/api/book/model'
import { GenericStore } from '../baseReducer'

export default class BookStore extends GenericStore {
    list: IBook[] = []
    selected?: string
}
