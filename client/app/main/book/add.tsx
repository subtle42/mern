import * as React from 'react'
import DropdownItem from 'reactstrap/lib/DropdownItem'
import Modal from 'reactstrap/lib/Modal'
import ModalHeader from 'reactstrap/lib/ModalHeader'
import ModalBody from 'reactstrap/lib/ModalBody'
import FormGroup from 'reactstrap/lib/FormGroup'
import Label from 'reactstrap/lib/Label'
import Input from 'reactstrap/lib/Input'
import FormFeedback from 'reactstrap/lib/FormFeedback'
import ModalFooter from 'reactstrap/lib/ModalFooter'
import Button from 'reactstrap/lib/Button'

import BookActions from 'data/books/actions'
import NotifActions from 'data/notifications/actions'
import { FormControl, FormCtrlGroup } from '../../_common/validation'
import * as Validators from '../../_common/validators'
import * as utils from '../../_common/utils'

interface Props {}

export const CreateBookButton: React.StatelessComponent<Props> = (prop: Props) => {
    const [isOpen, setOpen] = React.useState(false)
    const [rules, setRules] = React.useState(new FormCtrlGroup({
        title: new FormControl('', [
            Validators.isRequired,
            Validators.maxLength(15),
            Validators.minLength(3)
        ])
    }))

    const save = (event: React.FormEvent<any>) => {
        if (event) event.stopPropagation()

        BookActions.create(rules.value.title)
        .then(bookId => BookActions.select(bookId))
        .then(() => NotifActions.notify('success', `Created Book`))
        .then(() => setOpen(false))
        .catch(err => NotifActions.notify('danger', err.message))
    }

    const toggle = (event: React.FormEvent<any>) => {
        if (event) event.stopPropagation()
        rules.reset()
        setRules(Object.create(rules))
        setOpen(!isOpen)
    }

    return <DropdownItem onClick={toggle}>
        Add Book
        <Modal size='sm' isOpen={isOpen}>
            <ModalHeader>Create Book</ModalHeader>
            <ModalBody>
                <FormGroup>
                    <Label>Name:</Label>
                    <Input
                        type='text'
                        name='title'
                        placeholder='Enter Name'
                        onChange={e => utils.handleChange(e, rules, setRules)}
                        value={rules.get('title').value}
                        invalid={rules.get('title').invalid} />
                    <FormFeedback>{utils.getError(rules.get('title'))}</FormFeedback>
                </FormGroup>
            </ModalBody>
            <ModalFooter>
                <Button color='primary'
                    disabled={!rules.valid}
                    onClick={save}>
                    Create
                </Button>
                <Button color='secondary' onClick={toggle}>Cancel</Button>
            </ModalFooter>
        </Modal>
    </DropdownItem>
}
