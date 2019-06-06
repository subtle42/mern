import { FormCtrlGroup, FormControl, FormCtrlArray } from './validation'

const getSchemaFromEvent = (event, schema: FormCtrlGroup | FormControl | FormCtrlArray): FormControl => {
    if (event.target.name === '') return schema as FormControl
    return getSchema(event.target.name, schema)
}

export const getSchema = (path: string, schema: FormCtrlGroup | FormControl | FormCtrlArray): FormControl => {
    path.split('.').forEach(attr => {
        if (attr.indexOf('[') !== -1) {
            const firstPart = attr.split('[')[0]
            const index: number = parseInt(attr.match(/\[(.*?)\]/)[1], 10)
            schema = schema.controls[firstPart]
            schema = schema.controls[index]
        } else {
            schema = schema.controls[attr]
        }
    })
    return schema as FormControl
}

export const handleChange = (schema: FormCtrlGroup | FormControl | FormCtrlArray, setState: React.Dispatch<React.SetStateAction<any>>) => {
    return event => {
        const clone = Object.assign(Object.create(Object.getPrototypeOf(schema)), schema)
        getSchemaFromEvent(event, clone).value = event.target.value
        clone.digest()
        setState(clone)
    }
}

export const handleToggle = (schema: FormCtrlGroup | FormControl | FormCtrlArray, setState: React.Dispatch<React.SetStateAction<any>>) => {
    return event => {
        const clone = Object.assign(Object.create(Object.getPrototypeOf(schema)), schema)
        getSchemaFromEvent(event, clone).value = event.target.checked
        clone.digest()
        setState(clone)
    }
}

export const debounce = (fn: Function, delay: number) => {
    let timerId
    return (...args) => {
        if (timerId) {
            clearTimeout(timerId)
        }
        timerId = setTimeout(() => {
            fn(...args)
            timerId = null
        }, delay)
    }
}

export const getError = (ctrl: FormCtrlGroup | FormControl | FormCtrlArray): string => {
    return ctrl.error && ctrl.error.message
}
