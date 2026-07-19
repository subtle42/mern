import { model, Schema, InferSchemaType, Document} from 'mongoose'


export const pageSchema = new Schema({
    bookId: { type: String, required: true },
    name: { type: String, required: true },
    isDraggable: { type: Boolean, required: true, default: true },
    isResizable: { type: Boolean, required: true, default: true },
    preventCollision: { type: Boolean, required: true, default: false },
    margin: {
        type: [{ type: Number, required: true }],
        validate: [(val: number[]) => {
            return val.length === 2
        }, 'Margins must be an array of 2.'],
        default: [10, 10],
        required: true
    },
    containerPadding: {
        type: [{ type: Number, required: true }],
        validate: [(val: number[]) => {
            return val.length === 2
        }, 'Conatiner padding must be an array of 2.'],
        default: [60, 10],
        required: true
    },
    cols: { type: Number, min: 1, max: 60, default: 3, required: true },
    layout: { type: Array, default: [], required: true }
})


export const Page = model('Page', pageSchema)
export type IPage = InferSchemaType<typeof pageSchema> & {_id:any}
export type PageDoc = Document<unknown, {}, IPage>
