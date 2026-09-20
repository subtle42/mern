import * as mongoose from 'mongoose'
import {Schema, SchemaType} from 'mongoose'

/**
 * This stops Mongoose from throwing error during integration testing.
 * Due to trying to create a schema that already exists.
 */
export const createSchema = (name: string, schema: mongoose.Schema): any => {
    return mongoose.modelNames().indexOf(name) === -1
        ? mongoose.model(name, schema)
        : mongoose.connection.model(name)
}


const getType = (type: SchemaType) => {
    const instance = type.instance || type.getEmbeddedSchemaType().instance
    if (instance === 'String') return 'string'
    if (instance === 'Number') return 'number'
    if (instance === 'Boolean') return 'boolean'
    if (instance === 'Embedded') return 'object'
    if (instance === 'Array') return 'array'
    if (instance === 'ObjectId') return 'string'
}

const getInfo = (type: SchemaType) => {
    const res =  {type: getType(type)}
    if (res.type === 'object') return getObj(type)
    if (res.type === 'array') return getArr(type)
    return res
}

const getArr = (input: SchemaType) => {
    if (input.getEmbeddedSchemaType().instance === 'DocumentArrayElement') {
        return {
            type: 'array',
            items: myJsonTransform(input.getEmbeddedSchemaType().schema)
        }
    }
    const res = {
        type: 'array',
        items: getInfo(input.getEmbeddedSchemaType())
    }
    return res
}

const getObj = (input: SchemaType) => {
    const res = {
        type: 'object',
        properties: {},
        required: []
    }
    input.schema.eachPath((path, type) => {
        if (path.startsWith('__')) return
        res.properties[path] = getInfo(type)
        setValidators(path, type, res)
    })
    return res
}


export const myJsonTransform = (tmp: Schema) => {
    const res = {
        type: 'object',
        properties: {},
        required: []
    }

    tmp.eachPath((path, type) => {
        if (path.startsWith('__')) return
        res.properties[path] = getInfo(type)
        setValidators(path, type, res)
    })
    return res
}

const setValidators = (path: string, type: SchemaType, res: any) => {
    Object.entries(type.options).forEach(([key, val]) => {
        if (key === 'required') res.required.push(path)
        if (key === 'max') res.properties[path] = {...res.properties[path], maximum: val}
        if (key === 'min') res.properties[path] = {...res.properties[path], minimum: val}
        if (key === 'maxLength') res.properties[path] = {...res.properties[path], maxLength: val}
        if (key === 'minLength') res.properties[path] = {...res.properties[path], minLength: val}
        if (key === 'minItems') res.properties[path] = {...res.properties[path], minItems: val}
        if (key === 'maxItems') res.properties[path] = {...res.properties[path], maxItems: val}
    })
}

