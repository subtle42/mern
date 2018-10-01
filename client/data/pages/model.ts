import { IPage } from 'common/models'
import { GenericStore } from '../baseReducer'

export default class PageStore extends GenericStore {
    list: IPage[] = []
    selected?: string
}
