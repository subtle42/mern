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

import { OnEnter } from '../../_common/onEnter'
import { SubmitHandler, useForm } from 'react-hook-form'
import { handleRegister, hasErorrs } from '../utils'
import { createBook, selectBook } from '../../../data/books/actions'
import { myNotifActions } from '../../../data/notifications/actions'

interface Props {}
type Inputs = {
    title: string
}


export const CreateBookButton: React.FunctionComponent<Props> = (prop: Props) => {
    const [isOpen, setOpen] = React.useState(false)
    const {register, handleSubmit, reset, formState: { errors, isDirty }} = useForm<Inputs>({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: {title: ''}
    })
    const {ref, ...titleRegister} = register('title', handleRegister({
        required: true,
        minLength: 3,
        maxLength: 15
    }))


    const save:SubmitHandler<Inputs> = async(data) => {
        const bookId = await createBook(data.title)
        selectBook(bookId)
        myNotifActions.notify('success', `Created Book`)
        setOpen(false)
    }

    const myToggle = () => {
        reset()
        setOpen(!isOpen)
    }

    return <DropdownItem toggle={false} onClick={() => myToggle()}>
        Add Book
        <Modal size='sm' isOpen={isOpen} autoFocus={true}>
            <ModalHeader>Create Book</ModalHeader>
            <form onSubmit={handleSubmit(save)}>
                <ModalBody>
                    <FormGroup>
                        <Label>Name:</Label>
                        {/* <OnEnter callback={save}> */}
                        <Input
                            innerRef={ref}
                            {...titleRegister}
                            placeholder='Enter Name'
                            invalid={!!errors.title} />
                        {/* </OnEnter> */}
                        <FormFeedback>{errors.title?.message}</FormFeedback>
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color='primary'
                        disabled={!isDirty || hasErorrs(errors)}
                        type="submit">
                        Create
                    </Button>
                    <Button color='secondary' onClick={() => myToggle()}>Cancel</Button>
                </ModalFooter>
            </form>
        </Modal>
    </DropdownItem>
}
