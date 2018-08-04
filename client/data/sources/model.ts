import { ISource } from 'common/models'
import { GenericStore } from '../baseReducer'

export default class SourceStore extends GenericStore {
    list: ISource[] = []
}
