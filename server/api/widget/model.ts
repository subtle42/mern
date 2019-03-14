import { Schema, Model } from 'mongoose'
import { IWidgetModel } from '../../dbModels'
import { createSchema } from '../utils'

const AxisSchema = new Schema({
    isHidden: Boolean,
    max: Number,
    min: Number,
    ticks: Number
})

const WidgetSchema = new Schema({
    pageId: { type: String, required: true },
    sourceId: { type: String, required: true },
    margins: {
        top: { type: Number, required: true, default: 10 },
        bottom: { type: Number, required: true, default: 20 },
        left: { type: Number, required: true, default: 15 },
        right: { type: Number, required: true, default: 10 }
    },
    dimensions: { type: Array, required: true, default: [] },
    measures: { type: Array, required: true, default: [] },
    type: { type: String, required: true },
    xAxis: { type: AxisSchema, default: {} },
    yAxis: { type: AxisSchema, default: {} }
})

export const Widget: Model<IWidgetModel> = createSchema('Widget', WidgetSchema)
