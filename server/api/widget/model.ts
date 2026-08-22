import { Schema, model, InferSchemaType, Document, ObjectId } from 'mongoose'

const AxisSchema = new Schema({
    show: { type: Boolean, default: true, required: true },
    max: Number,
    min: Number,
    ticks: Number
}, {
    _id: false
})

const OtherSchema = new Schema({
    ticks: Number,
    showLegend: Boolean
}, {
    _id: false
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
    dimensions: { type: [{type: Number, required: true}], required: true, default: [] },
    measures: { type: [{type: String, required: true}], required: true, default: [] },
    type: {
        type: String,
        required: true,
        enum: ['histogram', 'scatter', 'line', 'barGroup']
    },
    xAxis: { 
        type: AxisSchema,
        required: true
    },
    yAxis: { type: AxisSchema, default: {}, required: true },
    other: { type: OtherSchema, default: {}, required: true }
})

export const Widget = model('Widget', WidgetSchema)
export type IWidget = InferSchemaType<typeof WidgetSchema> & {_id:any}
export type WidgetDoc = Document<any, {}, IWidget>

