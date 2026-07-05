import { Schema, model, InferSchemaType, Document, ObjectId } from 'mongoose'

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

export const WidgetSchema = new Schema({
    pageId: { type: String, required: true },
    sourceId: { type: String, required: true },
    margins: { type: {
            top: { type: Number, required: true },
            bottom: { type: Number, required: true},
            left: { type: Number, required: true },
            right: { type: Number, required: true}
        },
        required:true,
        default: { top: 5, bottom: 20, left: 35, right: 10 }
    },
    dimensions: { type: Array, required: true, default: [] },
    measures: { type: Array, required: true, default: [] },
    type: { type: String, required: true },
    xAxis: { type: AxisSchema, default: {} },
    yAxis: { type: AxisSchema, default: {} },
    other: { type: OtherSchema, default: {} }
})

export const Widget = model('Widget', WidgetSchema)
export type IWidget = InferSchemaType<typeof WidgetSchema> & {_id:any}
export type WidgetDoc = Document<any, {}, IWidget>

