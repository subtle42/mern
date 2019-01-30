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
    data
    controls: FormCtrlGroup | FormCtrlArray
    private default
    parent: FormCtrlGroup | FormCtrlArray
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
        this.data = value
        this.validators = validtors || []
    }

    reset (): void {
        this.dirty = false
        this.valid = false
        this.invalid = false
        this.data = this.default
        this.error = undefined
    }

    set value (value) {
        this.dirty = true
        this.data = value
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

    get value () {
        // let response = this.data
        // if (typeof this.data === 'string') {
        //     response = response.trim()
        // }
        return this.data
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

export class FormCtrlArray {
    error
    dirty: boolean
    pristine: boolean = true
    valid: boolean
    invalid: boolean
    parent: FormCtrlArray | FormCtrlGroup

    constructor (
        public controls: Array<FormControl | FormCtrlArray | FormCtrlGroup>
    ) {
        this.controls
        .forEach(ctrl => ctrl.parent = this)
    }

    digest (): void {
        const keys = this.controls.map((item, index) => index)
        this.isDirty(keys)
        this.isValid(keys)
        if (this.parent) this.parent.digest()
    }

    private isDirty (keys: number[]) {
        this.dirty = keys.filter(key => this.controls[key].dirty).length > 0
        this.pristine = !this.dirty
    }

    private isValid (keys: number[]) {
        this.valid = keys.filter(key => this.controls[key].valid).length === keys.length
        this.invalid = !this.valid
    }

    get value () {
        return this.controls.map(ctrl => ctrl.value)
    }

    reset (): void {
        this.controls.forEach(ctrl => ctrl.reset())
        this.digest()
    }

    set value (input: any[]) {
        this.controls.forEach((ctrl, index) => ctrl.value = input[index])
    }
}

export class FormCtrlGroup {
    error
    dirty: boolean
    pristine: boolean
    valid: boolean
    invalid: boolean
    parent: FormCtrlArray | FormCtrlGroup

    constructor (
        public controls: {
            [key: string]: FormControl | FormCtrlArray | FormCtrlGroup
        }
    ) {
        Object.keys(this.controls)
        .forEach(key => this.controls[key].parent = this)
    }

    digest (): void {
        const keys = Object.keys(this.controls)
        this.isDirty(keys)
        this.isValid(keys)
        if (this.parent) this.parent.digest()
    }

    private isDirty (keys: string[]) {
        this.dirty = keys.filter(key => this.controls[key].dirty).length > 0
        this.pristine = !this.dirty
    }

    private isValid (keys: string[]) {
        this.valid = keys.filter(key => this.controls[key].valid).length === keys.length
        this.invalid = !this.valid
    }

    get value () {
        const response = {}
        Object.keys(this.controls)
        .forEach(key => response[key] = this.controls[key].value)
        return response
    }

    reset (): void {
        Object.keys(this.controls).forEach(key => this.controls[key].reset())
        this.digest()
    }

    set value (input: {[key: string]: any}) {
        Object.keys(this.controls)
        .forEach(key => {
            if (!input[key]) return
            this.controls[key].value = input[key]
        })
    }
}
