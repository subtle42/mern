import { Schema, model, InferSchemaType, Document } from 'mongoose'

const AxisSchema = new Schema({
    show: { type: Boolean, default: true },
    max: Number,
    min: Number,
    ticks: Number
})

const OtherSchema = new Schema({
    ticks: Number,
    showLegend: Boolean
})

const WidgetSchema = new Schema({
    pageId: { type: String, required: true },
    sourceId: { type: String, required: true },
    margins: {
        top: { type: Number, required: true, default: 5 },
        bottom: { type: Number, required: true, default: 20 },
        left: { type: Number, required: true, default: 35 },
        right: { type: Number, required: true, default: 10 }
    },
    dimensions: { type: Array, required: true, default: [] },
    measures: { type: Array, required: true, default: [] },
    type: { type: String, required: true },
    xAxis: { type: AxisSchema, default: {} },
    yAxis: { type: AxisSchema, default: {} },
    other: { type: OtherSchema, default: {} }
})

export const Widget = model('Widget', WidgetSchema)
export type IWidget = InferSchemaType<typeof WidgetSchema> & {_id:string}
export type WidgetDoc = Document<unknown, {}, IWidget>

