import * as React from 'react'
import Form from 'reactstrap/lib/Form'
import { FormControl, FormCtrlGroup, FormCtrlArray } from '../../../_common/validation'
import * as Validators from '../../../_common/validators'
import Row from 'reactstrap/lib/Row'
import Col from 'reactstrap/lib/Col'
import FormGroup from 'reactstrap/lib/FormGroup'
import Label from 'reactstrap/lib/Label'
import Input from 'reactstrap/lib/Input'
import * as utils from '../../../_common/utils'
import { useBook } from '../../../_common/hooks'

interface Props {
    _id: string
}

export const BookEditForm: React.StatelessComponent<Props> = (props: Props) => {
    const book = useBook(props._id)
    const newRules = new FormCtrlGroup({
        _id: new FormControl('', [Validators.isRequired]),
        name: new FormControl('', [
            Validators.isRequired
        ]),
        owner: new FormControl('', [Validators.isRequired]),
        editors: new FormCtrlArray(
            book.editors.map(e => new FormControl(''))
        ),
        viewers: new FormCtrlArray(
            book.viewers.map(v => new FormControl(''))
        ),
        isPublic: new FormControl(false)
    })
    newRules.value = book
    const [rules, setRules] = React.useState(newRules)

    return <Form>
        <Row>
            <Col>
                <FormGroup>
                    <Label>Name</Label>
                    <Input type='text'
                        name='name'
                        onChange={utils.handleChange(rules, setRules)}
                        value={rules.get('name').value}
                        invalid={rules.get('name').invalid}/>
                </FormGroup>
            </Col>
        </Row>
    </Form>
}
