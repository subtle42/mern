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

import { SubmitHandler, useForm } from 'react-hook-form'
import { handleRegister, hasErorrs } from '../utils'
import { createBook, selectBook } from '../../../data/books/actions'
import { myNotifActions } from '../../../data/notifications/actions'
import { BookInputResolver, IBookInput } from '../../mySchemas'

interface Props {}


export const CreateBookButton: React.FunctionComponent<Props> = (prop: Props) => {
    const [isOpen, setOpen] = React.useState(false)
    const {register, handleSubmit, reset, formState: { errors, isDirty }} = useForm<IBookInput>({
        mode: 'onChange',
        resolver: BookInputResolver,
        reValidateMode: 'onChange',
        defaultValues: {name: ''}
    })
    const {ref, ...titleRegister} = register('name', handleRegister({
        required: true,
        minLength: 3,
        maxLength: 15
    }))


    const save:SubmitHandler<IBookInput> = async(data) => {
        console.log('data', data)
        const bookId = await createBook(data.name)
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
        <Modal size='sm' isOpen={isOpen} autoFocus={true} data-test-id="addBookBtn" role="addBookBtn">
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
                            invalid={!!errors.name} />
                        {/* </OnEnter> */}
                        <FormFeedback>{errors.name?.message}</FormFeedback>
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
