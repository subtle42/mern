import * as React from 'react'
import ModalHeader from 'reactstrap/lib/ModalHeader'
import ModalBody from 'reactstrap/lib/ModalBody'
import FormGroup from 'reactstrap/lib/FormGroup'
import Label from 'reactstrap/lib/Label'
import FormFeedback from 'reactstrap/lib/FormFeedback'
import ModalFooter from 'reactstrap/lib/ModalFooter'
import Button from 'reactstrap/lib/Button'
import NavItem from 'reactstrap/lib/NavItem'
import NavLink from 'reactstrap/lib/NavLink'
import FontAwesome from 'react-fontawesome'

import Modal from 'reactstrap/lib/Modal'
import { OnEnter } from '../../_common/onEnter'
import myPageActions from '../../../data/pages/actions'
import { myNotifActions } from '../../../data/notifications/actions'
import { SubmitHandler, useForm } from 'react-hook-form'
import { handleRegister, MyInput } from '../utils'

interface Props {}
type Inputs = {
    title: string
}

export const CreatePageButton: React.FunctionComponent<Props> = (props: Props) => {
    const { register, handleSubmit, reset, formState: { errors, isDirty } , getValues} = useForm<Inputs>({
        mode: 'onChange',
        reValidateMode: 'onChange'
    })

    const { ref, ...registerTitle } = register('title', {
        required: 'This is a required field',
        minLength: {value: 3, message: 'Min length of 3'},
        maxLength: {value: 15, message: 'Max lenghth of 15'}
    })

    const [isOpen, setOpen] = React.useState(false)

    const cancel = (event: React.FormEvent<any>) => {
        if (event) event.stopPropagation()
        setOpen(false)
    }

    const open = (event: React.FormEvent<any>) => {
        if (event) event.stopPropagation()
        reset({title: ''})
        setOpen(true)
    }

    const runSubmit:SubmitHandler<Inputs> = (data) => {
        const title: string = data.title
        console.log('title', title)
        myPageActions.create(title)
        .then(pageId => myPageActions.select(pageId))
        .then(() => myNotifActions.notify('success', `Created page: ${title}`))
        .then(() => setOpen(false))
        .catch(err => myNotifActions.notify('danger', err.message))
    }

    const close = (event: React.FormEvent<any>) => {
        if (event) event.stopPropagation()

        const title: string = getValues().title
        myPageActions.create(title)
        .then(pageId => myPageActions.select(pageId))
        .then(() => myNotifActions.notify('success', `Created page: ${title}`))
        .then(() => setOpen(false))
        .catch(err => myNotifActions.notify('danger', err.message))
    }

    const getModalTemplate = (): JSX.Element => {
        return <Modal size='sm' isOpen={isOpen}>
            <ModalHeader>Create Page</ModalHeader>
            <form onSubmit={handleSubmit(runSubmit)} noValidate={true}>
            <ModalBody>
                <FormGroup>
                    <Label>Name:</Label>
                    {/* <OnEnter callback={close}> */}
                    <MyInput
                        register={() => register('title', handleRegister({
                            required: true,
                            minLength: 3,
                            maxLength: 15
                        }))}
                        placeholder="Enter Name"
                        invalid={!!errors.title}
                        name='title'
                    />
                    {/* </OnEnter> */}
                    <FormFeedback>{errors.title?.message}</FormFeedback>
                </FormGroup>
            </ModalBody>
            <ModalFooter>
                <Button color='primary'
                    type='submit'
                    disabled={Object.keys(errors).length > 0 || !isDirty}
                >Create</Button>
                <Button color='secondary' onClick={cancel}>Cancel</Button>
            </ModalFooter>
            </form>
        </Modal>
    }

    return <NavItem onClick={open} style={{ cursor: 'pointer' }}>
        <NavLink style={{ height: 42, paddingTop: 11 }}>
            <FontAwesome name='plus' />
        </NavLink>
        {getModalTemplate()}
    </NavItem>
}
