import { Schema, Model } from 'mongoose'
import { IWidgetModel } from '../../dbModels'
import Utils from '../utils'

let WidgetSchema = new Schema({
    pageId: { type: String, required: true },
    sourceId: { type: String, required: true },
    margins: {
        top: { type: Number, required: true, default: 10 },
        bottom: { type: Number, required: true, default: 10 },
        left: { type: Number, required: true, default: 10 },
        right: { type: Number, required: true, default: 10 }
    },
    dimensions: { type: Array, required: true, default: [] },
    measures: { type: Array, required: true, default: [] },
    type: { type: String, required: true }
})

export const Widget: Model<IWidgetModel> = Utils.createSchema('Widget', WidgetSchema)
