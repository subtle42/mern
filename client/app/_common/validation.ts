export class FormError {
    message?: string
    type?: string
    expected?: number
    actual?: number
}

type ValidationErrors = {
    [key: string]: any;
}

export interface ValidatorFn {
    (c: FormControl): FormError | null
}

export class FormControl {
    value
    private default
    parent: FormCtrlGroup
    error?: ValidationErrors
    private validators: ValidatorFn[] = []
    dirty: boolean
    valid: boolean
    invalid: boolean

    constructor (
        value: any,
        validtors?: ValidatorFn[]
    ) {
        this.default = value
        this.value = value
        this.validators = validtors || []
    }

    reset (): void {
        this.dirty = false
        this.valid = false
        this.invalid = false
        this.value = this.default
        this.error = undefined
    }

    setValue (value): void {
        this.dirty = true
        this.value = value
        this.error = undefined

        this.validators.forEach(validFn => {
            if (this.error) return
            try {
                this.error = validFn(this)
            } catch (err) {
                console.error(err)
            }
        })

        this.valid = !this.error
        this.invalid = !!this.error
        this.parent.digest()
    }

    getValue () {
        let response = this.value
        if (typeof this.value === 'string') {
            response = response.trim()
        }
        return response
    }

    get isPristine () {
        return !this.valid
    }

    addValidator (newFn: ValidatorFn): void {
        this.validators.push(newFn)
    }

    setValidators (newValidtors: ValidatorFn[]): void {
        this.validators = newValidtors
    }
}

export class FormCtrlGroup {
    dirty: boolean
    pristine: boolean
    valid: boolean
    invalid: boolean

    constructor (
        public controls: {
            [key: string]: FormControl
        }
    ) {
        Object.keys(this.controls)
        .forEach(key => this.controls[key].parent = this)
    }

    digest (): void {
        const keys = Object.keys(this.controls)
        this.isDirty(keys)
        this.isValid(keys)
    }

    private isDirty (keys: string[]) {
        this.dirty = keys.filter(key => this.controls[key].dirty).length > 0
        this.pristine = !this.dirty
    }

    private isValid (keys: string[]) {
        this.valid = keys.filter(key => this.controls[key].valid).length === keys.length
        this.invalid = !this.valid
    }

    getValues (): any {
        const response = {}
        Object.keys(this.controls)
        .forEach(key => response[key] = this.controls[key].getValue())
        return response
    }

    reset (): void {
        Object.keys(this.controls).forEach(key => this.controls[key].reset())
        this.digest()
    }
}
