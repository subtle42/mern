import { model, Schema, InferSchemaType, Document} from 'mongoose'


const LayoutSchema = new Schema({
    i: {type: String, required: true},
    x: {type: Number, min: 0, required: true},
    y: {type: Number, min: 0, required: true},
    w: {type: Number, min: 1, required: true},
    h: {type: Number, min: 1, required: true},
}, {
    _id: false
})

const GridConfigSchema = new Schema({
    cols: {type: Number, min: 1, max: 100, default: 3, required: true},
    rowHeight: {type: Number, min: 100, max:1000, default: 150, required: true},
    margin: {
        type: [{type: Number, required: true}],
        validate: [(val: number[]) => {
            return val.length === 2
        }, 'Margins must be an array of 2.'],
        default: [10, 10],
        required: true
    },
    containerPadding: {
        type: [{type: Number, required: true}],
        validate: [(val: number[]) => {
            return val.length === 2
        }, 'Conatiner padding must be an array of 2.'],
        default: [10, 10],
        required: true
    }
}, {
    _id: false,
})

const ResizeConfigSchema = new Schema({
    enabled: {type: Boolean, default: true, required: true}
}, {
    _id: false
})

const DropConfigSchema = new Schema({
    enabled: {type: Boolean, default: true, required: true}
}, {
    _id: false
})

export const pageSchema = new Schema({
    bookId: { type: String, required: true },
    name: { type: String, required: true },
    layout: { type: [LayoutSchema], default: [], required: true },
    gridConfig: { type: GridConfigSchema, default: () => ({}),  required: true },
    resizeConfig: { type: ResizeConfigSchema, default: () => ({}), required: true },
    dropConfig: { type: DropConfigSchema, default: () => ({}), required: true }
})


export const Page = model('Page', pageSchema)
export type IPage = InferSchemaType<typeof pageSchema> & {_id:any}
export type PageDoc = Document<unknown, {}, IPage>
