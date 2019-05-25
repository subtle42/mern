import * as React from 'react'
import ModalHeader from 'reactstrap/lib/ModalHeader'
import ModalBody from 'reactstrap/lib/ModalBody'
import FormGroup from 'reactstrap/lib/FormGroup'
import Label from 'reactstrap/lib/Label'
import Input from 'reactstrap/lib/Input'
import FormFeedback from 'reactstrap/lib/FormFeedback'
import ModalFooter from 'reactstrap/lib/ModalFooter'
import Button from 'reactstrap/lib/Button'
import NavItem from 'reactstrap/lib/NavItem'
import NavLink from 'reactstrap/lib/NavLink'
import * as FontAwesome from 'react-fontawesome'

import pageActions from 'data/pages/actions'
import NotifActions from 'data/notifications/actions'
import { FormCtrlGroup, FormControl } from '../../_common/validation'
import * as Validators from '../../_common/validators'
import * as utils from '../../_common/utils'
import Modal from 'reactstrap/lib/Modal'

interface Props {}

export const CreatePageButton: React.FunctionComponent<Props> = (props: Props) => {
    const [isOpen, setOpen] = React.useState(false)
    const [rules, setRules] = React.useState(new FormCtrlGroup({
        title: new FormControl('', [
            Validators.isRequired,
            Validators.minLength(3),
            Validators.maxLength(15)
        ])
    }))

    const cancel = (event: React.FormEvent<any>) => {
        if (event) event.stopPropagation()
        setOpen(false)
    }

    const open = (event: React.FormEvent<any>) => {
        if (event) event.stopPropagation()
        setOpen(true)
        rules.reset()
        setRules(rules)
    }

    const close = (event: React.FormEvent<any>) => {
        if (event) event.stopPropagation()
        const title: string = rules.value.title
        pageActions.create(title)
        .then(pageId => pageActions.select(pageId))
        .then(() => NotifActions.notify('success', `Created page: ${title}`))
        .then(() => setOpen(false))
        .catch(err => NotifActions.notify('danger', err.message))
    }

    const getModalTemplate = (): JSX.Element => {
        return <Modal size='sm' isOpen={isOpen}>
            <ModalHeader>Create Page</ModalHeader>
            <ModalBody>
                <FormGroup>
                    <Label>Name:</Label>
                    <Input
                        type='text'
                        name='title'
                        placeholder='Enter Name'
                        onChange={utils.handleChange(rules, setRules)}
                        value={rules.get('title').value}
                        invalid={rules.get('title').invalid}/>
                    <FormFeedback>{utils.getError(rules.get('title'))}</FormFeedback>
                </FormGroup>
            </ModalBody>
            <ModalFooter>
                <Button color='primary'
                    disabled={rules.invalid || rules.pristine}
                    onClick={close}
                >Create</Button>
                <Button color='secondary' onClick={cancel}>Cancel</Button>
            </ModalFooter>
        </Modal>
    }

    return <NavItem onClick={open}>
        <NavLink style={{ height: 42 }}>
            <FontAwesome name='plus' />
        </NavLink>
        {getModalTemplate()}
    </NavItem>
}
