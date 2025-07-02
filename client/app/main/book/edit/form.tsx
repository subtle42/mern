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
import { myBookActions } from '../../../../data/books/actions'
import { myNotifActions } from '../../../../data/notifications/actions'



interface Props {
    _id: string
    onDone: () => void
}

export const BookEditForm: React.FunctionComponent<Props> = (props: Props) => {
    const {register, handleSubmit, formState, getValues, setValue} = useForm()
    const errors = formState.errors

    const book = useBook(props._id)
    // const newRules = new FormCtrlGroup({
    //     name: new FormControl('', [
    //         Validators.isRequired
    //     ]),
    //     isPublic: new FormControl(false)
    // })
    // newRules.value = book
    // const [rules, setRules] = React.useState(newRules)

    const save = (data) => {
        const tmp = Object.assign({}, book, data)
        myBookActions.update(tmp)
        .then(() => myNotifActions.success(`Updated book: ${tmp.name}`))
        .then(() => props.onDone())
        .catch(err => myNotifActions.error(err.message))
    }


    const getForm = (): JSX.Element => {
        return <Row>
            <Col xs={6}>
                <FormGroup>
                    <Label>Name</Label>
                    <Input type='text'
                        {...register('name', {required: 'Book name is required'})}
                        invalid={errors.name}>
                    </Input>
                    <FormFeedback>{errors.name?.message}</FormFeedback>
                </FormGroup>
            </Col>
            <Col xs={6}>
                <FormGroup style={{ paddingTop: 38 }}>
                    {/* <CustomInput
                        {...register('isPublic')}
                        label='Is Public'
                        type='switch'
                        onChange={setValue('isPublic', !getValues('isPublic'))}
                        checked={getValues('isPublic')}/> */}
                </FormGroup>
            </Col>
        </Row>
    }

    return <div>
        <Form onSubmit={handleSubmit(save)}>
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
                    type="submit"
                    onClick={() => props.onDone()}>
                    Cancel
                </Button>
            </ModalFooter>
        </Form>
    </div>
}
