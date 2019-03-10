import * as React from 'react'
import FormGroup from 'reactstrap/lib/FormGroup'
import Label from 'reactstrap/lib/Label'
import Input, { InputType } from 'reactstrap/lib/Input'
import { FormCtrlArray, FormCtrlGroup } from './validation'
import * as utils from './utils'
import FormFeedback from 'reactstrap/lib/FormFeedback'

const capitalize = (input: string): string => {
    return input.charAt(0).toUpperCase() + input.slice(1)
}

export const buildInput = (path: string,
        type: InputType,
        rules: FormCtrlArray | FormCtrlGroup,
        setRules: React.Dispatch<React.SetStateAction<any>>,
        label?: string,
        config: object = {}
    ): JSX.Element => {

    const schema = utils.getSchema(path, rules)
    return <div>
        <Label>{label || capitalize(path)}</Label>
        <Input
            {...config}
            type={type}
            name={path}
            onChange={utils.handleChange(rules, setRules)}
            value={schema.value}
            invalid={schema.invalid} />
        <FormFeedback>{utils.getError(schema)}</FormFeedback>
    </div>
}
