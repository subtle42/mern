import { Schema, Model } from 'mongoose'
import { ISourceModel } from '../../dbModels'
import Utils from '../utils'

let SourceSchema = new Schema({
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

export const Source: Model<ISourceModel> = Utils.createSchema('Source', SourceSchema)
