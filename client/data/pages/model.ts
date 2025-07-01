import { IPage } from '@mern/server/api/page/model'
import { GenericStore } from '../baseReducer'

export default class PageStore extends GenericStore {
    list: IPage[] = []
    selected?: string
}
