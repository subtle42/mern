import { model, Schema , InferSchemaType, Document} from 'mongoose'
import { PageDoc } from '../page/model'


export const bookSchema = new Schema({
    name: { type: String, required: true },
    pages: { type: [String], required: true },
    owner: { type: String, required: true },
    editors: { type: [String], required: true },
    viewers: { type: [String], required: true },
    isPublic: { type: Boolean, required: true, default: false }
}, {
    query: {
        getPageParent(page: PageDoc) {
            return this.findById(page.get('bookId'))
        }
    },
    methods: {
        hasOwnerAccess(userId: string) {
            if (this.owner === userId) return
            throw Error(`User does not have owner access to shareModel: ${this._id}`)
        },
        hasEditAccess(userId: string) {
            if (this.owner === userId) return
            if (this.editors.includes(userId)) return
            throw Error(`User does not have owner access to book: ${this._id}`)
        },
        hasViewerAccess(userId: string) {
            if (this.isPublic) return
            if (this.owner === userId) return
            if (this.editors.indexOf(userId) !== -1) return
            if (this.viewers.indexOf(userId) !== -1) return
            throw Error(`User does NOT have owner access to item: ${this._id}`)
        }
    }
})

export const Book = model('Book', bookSchema)
export type IBook = InferSchemaType<typeof bookSchema> & {_id: any}
export type BookDoc = Document<unknown, {}, IBook>
