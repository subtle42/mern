import * as React from 'react'
import Form from 'reactstrap/lib/Form'
import Row from 'reactstrap/lib/Row'
import Col from 'reactstrap/lib/Col'
import FormGroup from 'reactstrap/lib/FormGroup'
import Label from 'reactstrap/lib/Label'
import Input from 'reactstrap/lib/Input'
import ModalHeader from 'reactstrap/lib/ModalHeader'
import ModalBody from 'reactstrap/lib/ModalBody'
import ModalFooter from 'reactstrap/lib/ModalFooter'
import Button from 'reactstrap/lib/Button'

import { FormControl, FormCtrlGroup } from '../../../_common/validation'
import * as Validators from '../../../_common/validators'
import * as utils from '../../../_common/utils'
import { useBook } from '../../../_common/hooks'
import BookActions from 'data/books/actions'
import NotifActions from 'data/notifications/actions'
import CustomInput from 'reactstrap/lib/CustomInput'

interface Props {
    _id: string
    onDone: () => void
}

export const BookEditForm: React.FunctionComponent<Props> = (props: Props) => {
    const book = useBook(props._id)
    const newRules = new FormCtrlGroup({
        // _id: new FormControl('', [Validators.isRequired]),
        name: new FormControl('', [
            Validators.isRequired
        ]),
        // owner: new FormControl('', [Validators.isRequired]),
        // editors: new FormCtrlArray(
        //     book.editors.map(e => new FormControl(''))
        // ),
        // viewers: new FormCtrlArray(
        //     book.viewers.map(v => new FormControl(''))
        // ),
        isPublic: new FormControl(false)
    })
    newRules.value = book
    const [rules, setRules] = React.useState(newRules)

    const save = () => {
        const tmp = Object.assign({}, book, rules.value)
        BookActions.update(tmp)
        .then(() => NotifActions.success(`Updated book: ${tmp.name}`))
        .then(() => props.onDone())
        .catch(err => NotifActions.error(err.message))
    }

    const getForm = (): JSX.Element => {
        return <Form>
            <Row>
                <Col xs={6}>
                    <FormGroup>
                        <Label>Name</Label>
                        <Input type='text'
                            name='name'
                            onChange={utils.handleChange(rules, setRules)}
                            value={rules.get('name').value}
                            invalid={rules.get('name').invalid}/>
                    </FormGroup>
                </Col>
                <Col xs={6}>
                    <FormGroup style={{ paddingTop: 38 }}>
                        <CustomInput
                            id='isPublic'
                            label='Is Public'
                            type='switch'
                            name='isPublic'
                            onChange={utils.handleToggle(rules, setRules)}
                            checked={rules.get('isPublic').value}/>
                    </FormGroup>
                </Col>
            </Row>
        </Form>
    }

    return <div>
        <ModalHeader>Edit Book</ModalHeader>
        <ModalBody>
            {getForm()}
        </ModalBody>
        <ModalFooter>
            <Button color='primary'
                onClick={save}>
                Save
            </Button>
            <Button color='secondary'
                onClick={() => props.onDone()}>
                Cancel
            </Button>
        </ModalFooter>
    </div>
}
