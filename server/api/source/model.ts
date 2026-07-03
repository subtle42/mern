import { Schema, model, InferSchemaType, Document } from 'mongoose'

const SourceColumnSchema = new Schema({
    name: {type: String, required: true},
    ref: {type: String, required: true},
    type: {
        type: String,
        required: true,
        enum: ['number', 'group', 'text', 'datetime']
    },
    values: {type: [String], default: [], required: false},
    min: Number,
    max: Number,
})

export const SourceSchema = new Schema({
    title: { type: String, required: true },
    location: { type: String, required: true },
    size: { type: Number, default: 0 },
    rowCount: { type: Number, default: 0 },
    columns: { type: [SourceColumnSchema], default: [] },
    owner: { type: String, required: true },
    editors: { type: [String], default: [] },
    viewers: { type: [String], default: [] },
    isPublic: { type: Boolean, default: false }
})

export const Source = model('Source', SourceSchema)
export type ISourceColumn = InferSchemaType<typeof SourceColumnSchema>
export type ISource = Omit<InferSchemaType<typeof SourceSchema>, 'columns'> & { _id: any, columns: ISourceColumn[]}
export type SourceDoc = Document<unknown, {}, ISource>
export type ISourceColumnType = 'number' | 'group' | 'text' | 'datetime'
