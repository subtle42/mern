import { ValidatorFn, FormControl } from './validation'

export const isRequired: ValidatorFn = (ctrl: FormControl) => {
    if (ctrl.value === undefined
        || ctrl.value === '') {
        return {
            message: 'This is a required field.'
        }
    }
    return undefined
}

export const maxLength = (expected: number): ValidatorFn => {
    return (ctrl: FormControl) => {
        const actual = ctrl.value.trim().length
        if (actual > expected) {
            return {
                message: `Expected length to be less than ${expected}.`,
                expected,
                actual
            }
        }
        return undefined
    }
}

export const minLength = (expected: number): ValidatorFn => {
    return (ctrl: FormControl) => {
        const actual = ctrl.value.trim().length
        if (actual < expected) {
            return {
                message: `Expected length to be greater than ${expected}.`,
                expected,
                actual
            }
        }
        return undefined
    }
}

export const min = (expected: number): ValidatorFn => {
    return (ctrl: FormControl) => {
        const actual = ctrl.value
        if (actual < expected) {
            return {
                message: `Expected number to be greater than ${expected}.`,
                expected,
                actual
            }
        }
        return undefined
    }
}

export const max = (expected: number): ValidatorFn => {
    return (ctrl: FormControl) => {
        const actual = ctrl.value
        if (actual > expected) {
            return {
                message: `Expected number to be less than ${expected}.`,
                expected,
                actual
            }
        }
        return undefined
    }
}

const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const isEmail: ValidatorFn = (ctrl: FormControl) => {
      if (!emailRegex.test(String(ctrl.value).toLowerCase())) {
        return {
            message: 'Input must be in email format.'
        }
    }
    return undefined
}
