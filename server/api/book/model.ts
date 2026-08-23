import { model, Schema , InferSchemaType, Document, SchemaDefinitionProperty} from 'mongoose'
import { PageDoc } from '../page/model'


export const bookSchema = new Schema({
    name: { type: String, required: true, minLength: 3, maxLength: 30 },
    pages: { type: [{type: String, required: true}], required: true },
    owner: { type: String, required: true },
    editors: { type: [{type: String, required: true}], required: true },
    viewers: { type: [{type: String, required: true}], required: true },
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

console.log('before each patther')
bookSchema.eachPath((path, type) => {
    type.validators.forEach(v => {
        if (v.type === 'required') return
        if (v.type === 'minlength') return
        if (v.type === 'maxlength') return
        if (v.type === 'max') return
        if (v.type === 'min') return
    })
})

const getType = (type:unknown) => {
    if (Array.isArray(type)) return 'array'
    if (type === String) return 'string'
    if (type === Boolean) return 'boolean'
    if (type === Number) return 'number'
}


const tranformSchema = (s: Schema) => {
    console.log('in transofrm')
    const res = {
        type: 'object',
        properties: {
            _id: {type: 'string'}
        },
        required: ['_id']
    }
    Object.keys(s.obj).forEach(key => {
        if (typeof s.obj[key] !== 'object') {
            return res.properties[key] = {type: getType(s.obj[key])}
        }

        const {required, minLength, type, maxLength, min, max} = {...s.obj[key] as any}
        console.log(key, required, minLength, type)


        res.properties[key] = {type: getType(type)}
        if (minLength) res.properties[key]['minLength'] = minLength
        if (minLength) res.properties[key]['maxLength'] = maxLength
        if (min) res.properties[key]['minimum'] = min
        if (max) res.properties[key]['maximum'] = max
        if (required) res.required.push(key)
        
        if (res.properties[key]['type'] === 'array') {
            res.properties[key]['items'] = getItemSchema(type[0])
        }
        // if (res.properties[k])
    })
    console.log(JSON.stringify(res))
    return res
}

const getItemSchema = (item) => {
    console.log('item', item)
    if (typeof item !== 'object') {
        return {type: getType(item)}
    }

    const res = {
        type: getType(item.type)
    }
    if (res.type === 'object') {}
    return res
}

// export const dantest = tranformSchema(bookSchema)