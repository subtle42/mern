import { IWidget } from 'common/models'
import { GenericStore } from '../baseReducer'

export default class WidgetStore extends GenericStore {
    list: IWidget[] = []
    sizes: {} = {}
    data: {[key: string]: any[]} = {}
}
