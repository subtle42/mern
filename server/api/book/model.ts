import { Model, Schema } from 'mongoose'
import { IBookModel } from '../../dbModels'
import { createSchema } from '../utils'

const BookSchema = new Schema({
    name: { type: String, required: true },
    pages: [{ type: String, required: true }],
    owner: { type: String, required: true },
    editors: [{ type: String, required: true }],
    viewers: [{ type: String, required: true }],
    isPublic: { type: Boolean, required: true, default: false }
})

export const Book: Model<IBookModel> = createSchema('Book', BookSchema)
