import { IWidget } from '@mern/server/api/widget/model'
import { GenericStore } from '../baseReducer'

export default class WidgetStore extends GenericStore {
    list: IWidget[] = []
    sizes: {} = {}
    data: {[key: string]: any[]} = {}
}
