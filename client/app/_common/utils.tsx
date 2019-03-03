import { FormCtrlGroup, FormControl, FormCtrlArray } from './validation'

export const handleChange = (event, schema: FormCtrlGroup | FormControl | FormCtrlArray, setState: React.Dispatch<React.SetStateAction<any>>) => {
    const origSchema = schema
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
    schema.value = event.target.value
    setState(Object.create(origSchema))
}

export const handleToggle = (event, schema: FormCtrlGroup | FormControl | FormCtrlArray, setState: React.Dispatch<React.SetStateAction<any>>) => {
    const origSchema = schema
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
    schema.value = event.target.checked
    setState(Object.create(origSchema))
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
