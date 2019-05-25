import * as React from 'react'
import * as FontAwesome from 'react-fontawesome'
import InputGroup from 'reactstrap/lib/InputGroup'
import InputGroupAddon from 'reactstrap/lib/InputGroupAddon'
import Button from 'reactstrap/lib/Button'
import Input from 'reactstrap/lib/Input'
import FormFeedback from 'reactstrap/lib/FormFeedback'

import { FormControl } from '../../../_common/validation'
import * as Validators from '../../../_common/validators'
import * as utils from '../../../_common/utils'

interface Props {
    name: string
    update: (name: string) => void
}

export const ColumnNameField: React.FunctionComponent<Props> = (props: Props) => {
    const [isEditMode, setEditMode] = React.useState(false)
    const [rules, setRules] = React.useState(new FormControl(props.name, [
        Validators.isRequired,
        Validators.maxLength(30)
    ]))

    return <div>
        <span hidden={isEditMode}>
            {props.name}
            <FontAwesome name='edit'
                style={{ paddingLeft: 10, cursor: 'pointer' }}
                onClick={() => setEditMode(true)} />
        </span>
        <InputGroup hidden={!isEditMode}>
            <InputGroupAddon addonType='prepend'>
                <Button color='primary'
                    disabled={rules.invalid}
                    onClick={() => {
                        props.update(rules.value)
                        setEditMode(false)
                    }}>
                    Done
                </Button>
            </InputGroupAddon>
            <Input type='text'
                style={{ width: 250 }}
                value={rules.value}
                invalid={rules.invalid}
                onChange={utils.handleChange(rules, setRules)}/>
            <FormFeedback>{utils.getError(rules)}</FormFeedback>
        </InputGroup>
    </div>
}
