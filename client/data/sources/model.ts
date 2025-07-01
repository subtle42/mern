import { ISource } from '@mern/server/api/source/model'
import { GenericStore } from '../baseReducer'

export default class SourceStore extends GenericStore {
    list: ISource[] = []
    filters: {[key: string]: {}} = {}
}
