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

import { useBook } from '../../../_common/hooks'
import { useForm } from 'react-hook-form'
import { FormFeedback } from 'reactstrap'
import { myNotifActions } from '../../../../data/notifications/actions'
import { handleAsync, handleRegister, MyInput } from '../../utils'
import { IBook } from '@mern/server/api/book/model'
import { updateBook } from '../../../../data/books/actions'



interface Props {
    _id: string
    onDone: () => void
}


export const BookEditForm: React.FunctionComponent<Props> = (props: Props) => {
    const book = useBook(props._id)
    const {register, handleSubmit, formState: {isValid, errors}} = useForm<IBook>({
        defaultValues: book,
        mode: 'onChange',
        reValidateMode: 'onChange'
    })

    const save = (async(data) => {
        const tmp = Object.assign({}, book, data)
        await updateBook(tmp)
        myNotifActions.success(`Updated book: ${tmp.name}`)
        props.onDone()
    })


    const getForm = (): JSX.Element => {
        return <Row>
            <Col xs={6}>
                <FormGroup>
                    <Label>Name</Label>
                    <MyInput type='text'
                        register={() => register('name', handleRegister({
                            required: true,
                            minLength:3,
                            maxLength: 20
                        }))}
                        placeholder='Book Name'
                        invalid={!!errors.name}
                    />
                    <FormFeedback>{errors.name?.message}</FormFeedback>
                </FormGroup>
            </Col>
            <Col xs={6}>
                <FormGroup switch style={{ paddingTop: 38 }}>
                    <MyInput type='switch'
                        register={() => register('isPublic')}
                        invalid={!!errors.name}
                    />
                    <Label>Is Public</Label>
                </FormGroup>
            </Col>
        </Row>
    }

    return <form onSubmit={handleSubmit(save)}>
        <ModalHeader>Edit Book</ModalHeader>
        <ModalBody>
            {getForm()}
        </ModalBody>
        <ModalFooter>
            <Button color='primary'
                disabled={!isValid}
                type='submit'>
                Save
            </Button>
            <Button color='secondary'
                type="submit"
                onClick={() => props.onDone()}>
                Cancel
            </Button>
        </ModalFooter>
    </form>
}
