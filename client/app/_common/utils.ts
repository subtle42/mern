import { FormCtrlGroup, FormControl, FormCtrlArray } from './validation'

const getSchemaFromEvent = (event, schema: FormCtrlGroup | FormControl | FormCtrlArray): FormControl => {
    if (event.target.name === '') return schema as FormControl

    event.target.name.split('.').forEach(attr => {
        if (attr.indexOf('[') !== -1) {
            const firstPart = attr.split('[')[0]
            const index: number = parseInt(this.getBracketValue.exec(attr)[1], 10)
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
        getSchemaFromEvent(event, schema).value = event.target.value
        setState(Object.create(schema))
    }
}

export const handleToggle = (schema: FormCtrlGroup | FormControl | FormCtrlArray, setState: React.Dispatch<React.SetStateAction<any>>) => {
    return event => {
        getSchemaFromEvent(event, schema).value = event.target.checked
        setState(Object.create(schema))
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
