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
import { myNotifActions } from '../../../data/notifications/actions'
import { SubmitHandler, useForm } from 'react-hook-form'
import { MyInput } from '../utils'
import { createPage, selectPage } from '../../../data/pages/actions'
import { IPageInput, PageInputResolver } from '../../mySchemas'
import { store } from '../../../data/store'

interface Props {}

export const CreatePageButton: React.FunctionComponent<Props> = (props: Props) => {
    const bookdId = store.getState().books.selected
    const { register, reset, formState: { errors, isDirty } , getValues} = useForm<IPageInput>({
        resolver: PageInputResolver,
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: {bookId: bookdId, name: ''}
    })


    const [isOpen, setOpen] = React.useState(false)

    const cancel = (event: React.FormEvent<any>) => {
        if (event) event.stopPropagation()
        setOpen(false)
    }

    const open = (event: React.FormEvent<any>) => {
        if (event) event.stopPropagation()
        reset({name: '', bookId: bookdId})
        setOpen(true)
    }

    const runSubmit:SubmitHandler<IPageInput> = async(data) => {
        console.log(getValues('name'))
        console.log('going to create', data)
        const pageId = await createPage(data)
        selectPage(pageId)
        myNotifActions.notify('success', `Created page: ${data.name}`)
        setOpen(false)
        // .catch(err => myNotifActions.notify('danger', err.message))
    }

    const getModalTemplate = (): React.JSX.Element => {
        return <Modal size='sm' isOpen={isOpen} data-testid='addPageModal'>
            <ModalHeader>Create Page</ModalHeader>
            <form onSubmit={() => {
                console.log('testing')
                runSubmit(getValues())}} noValidate={true}>
            <ModalBody>
                <FormGroup>
                    <Label>Name:</Label>
                    {/* <OnEnter callback={close}> */}
                    <MyInput
                        register={() => register('name')}
                        placeholder="Enter Name"
                        invalid={!!errors.name}
                    />
                    {/* </OnEnter> */}
                    <FormFeedback>{errors.name?.message}</FormFeedback>
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

    return <NavItem onClick={open} style={{ cursor: 'pointer' }} data-testid="addPageBtn">
        <NavLink style={{ height: 42, paddingTop: 11 }}>
            <FontAwesome name='plus' />
        </NavLink>
        {getModalTemplate()}
    </NavItem>
}
