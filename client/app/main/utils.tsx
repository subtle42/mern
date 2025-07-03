import { InputProps } from "reactstrap"
import Input from "reactstrap/lib/Input"
import { myNotifActions } from "../../data/notifications/actions"
import { UseFormRegisterReturn } from "react-hook-form"

export const handleAsync = async(myFn: (...inputs) => void) => {
    return async(...inputs) => {
        try {
            myFn(...inputs)
        }
        catch(err: any) {
            myNotifActions.error(err.message || err)
        }
    }
}

type RegisterOpts = Partial<{
    required: boolean
    min: number
    max: number
    maxLength: number
    minLength: number
    valueAsNumber: boolean
}>
export const handleRegister = (opts: RegisterOpts = {}) => {
    const myOpts = {} as any
    if (opts.required) myOpts.required = 'Required'
    if (opts.min) myOpts.min = {
        value: opts.min,
        message: `Min is ${opts.min}`
    }
    if (opts.max) myOpts.max = {
        value: opts.max,
        message: `Max is ${opts.max}`
    }
    if (opts.minLength) myOpts.minLength = {
        value: opts.minLength,
        message: `Min length is ${opts.minLength}`
    }
    if (opts.maxLength) myOpts.maxLength = {
        value: opts.maxLength,
        message: `Max length is ${opts.maxLength}`
    }
    if (opts.valueAsNumber) myOpts.valueAsNumber = true
    return myOpts
}
export const hasErorrs = (errs:object) => Object.keys(errs).length > 0

type MyInputProps = {
    register: () => UseFormRegisterReturn<any>
} & InputProps


export const MyInput = ({register, ...args}: MyInputProps) => {
    const {ref, ...registerField} = register()
    return <Input innerRef={ref} {...registerField} {...args}></Input>
}