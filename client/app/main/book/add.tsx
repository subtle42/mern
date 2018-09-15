import * as React from 'react'
import { Input, Label, ModalHeader, ModalBody, ModalFooter, Modal, FormGroup, DropdownItem, Button, FormFeedback } from 'reactstrap'
import BookActions from 'data/books/actions'
import NotifActions from 'data/notifications/actions'
import store from 'data/store'
import { FormControl, FormCtrlGroup } from '../../_common/validation'
import * as Validators from '../../_common/validators'

class State {
    showModal: boolean = false
    title: string = ''
    rules: FormCtrlGroup
    validationState?: myStyle = undefined
}

type myStyle = 'success' | 'warning' | 'error'

export default class CreateBookButton extends React.Component<undefined, State> {
    state: State = new State()

    componentWillMount () {
        const rules = new FormCtrlGroup({
            title: new FormControl('', [
                Validators.isRequired,
                Validators.maxLength(15),
                Validators.minLength(3)
            ])
        })
        this.setState({ rules })
    }

    toggle = (event?: React.FormEvent<any>) => {
        if (event) event.stopPropagation()
        this.state.rules.reset()
        this.setState({
            showModal: !this.state.showModal,
            rules: this.state.rules
        })
    }

    save = (event: React.FormEvent<any>) => {
        if (event) event.stopPropagation()
        const myFormValues = this.state.rules.getValues()

        BookActions.create(myFormValues.title)
        .then(bookId => store.getState().books.list.filter(book => book._id === bookId)[0])
        .then(newBook => BookActions.select(newBook))
        .then(() => NotifActions.notify('success', `Created Book`))
        .then(() => this.toggle())
        .catch(err => NotifActions.notify('danger', err))
    }

    handleChange = (event: React.FormEvent<any>) => {
        const target: any = event.target
        this.state.rules.controls[target.name].setValue(target.value)
        this.setState(this.state)
    }

    getError = (field: string): string => {
        return this.state.rules.controls[field].error
            ? this.state.rules.controls[field].error.message
            : ''
    }

    render () {
        return (
            <DropdownItem onClick={this.toggle}>
                Add Book
                <Modal size='sm' isOpen={this.state.showModal}>
                    <ModalHeader>Create Book</ModalHeader>
                    <ModalBody>
                        <FormGroup>
                            <Label>Name:</Label>
                            <Input
                                type='text'
                                name='title'
                                placeholder='Enter Name'
                                onChange={this.handleChange}
                                value={this.state.rules.controls.title.value}
                                invalid={this.state.rules.controls.title.invalid}
                            />
                            <FormFeedback>{this.getError('title')}</FormFeedback>
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button color='primary'
                            disabled={this.state.rules.invalid || this.state.rules.pristine}
                            onClick={this.save}
                        >Create</Button>
                        <Button color='secondary' onClick={this.toggle}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </DropdownItem>
        )
    }
}
