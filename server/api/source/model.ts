import { Schema, model, InferSchemaType, Document } from 'mongoose'

const SourceSchema = new Schema({
    title: { type: String, required: true },
    location: { type: String, required: true },
    size: { type: Number, default: 0 },
    rowCount: { type: Number, default: 0 },
    columns: { type: [], default: [] },
    owner: { type: String, required: true },
    editors: { type: [String], default: [] },
    viewers: { type: [String], default: [] },
    isPublic: { type: Boolean, default: false }
})

export const Source = model('Source', SourceSchema)
export type ISource = InferSchemaType<typeof SourceSchema> & {_id: any}
export type SourceDoc = Document<unknown, {}, ISource>
