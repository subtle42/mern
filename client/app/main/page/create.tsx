import * as React from 'react'
import { Modal, ModalBody, ModalHeader, ModalFooter, Label, Input, Button, FormGroup, NavItem, NavLink, FormFeedback } from 'reactstrap'
import pageActions from 'data/pages/actions'
import * as FontAwesome from 'react-fontawesome'
import { FormCtrlGroup, FormControl } from '../../_common/validation'
import * as Validators from '../../_common/validators'
import NotifActions from 'data/notifications/actions'

class State {
    showModal?: boolean = false
    rules: FormCtrlGroup
}

interface Props {
    _id?: string
}

export class CreatePageButton extends React.Component<Props, State> {
    state: State = new State()

    componentWillMount () {
        const rules = new FormCtrlGroup({
            title: new FormControl('', [
                Validators.isRequired,
                Validators.minLength(3),
                Validators.maxLength(15)
            ])
        })
        this.setState({ rules })
    }

    close = (event?) => {
        if (event) event.stopPropagation()
        const formValues = this.state.rules.getValues()
        pageActions.create(formValues.title)
        .then(pageId => pageActions.mySelect(pageId))
        .then(() => NotifActions.notify('success', `Created page: ${formValues.title}`))
        .then(() => this.toggle())
        .catch(err => NotifActions.notify('danger', JSON.stringify(err)))
    }

    toggle = (event?) => {
        if (event) event.stopPropagation()
        this.state.rules.reset()
        this.setState({
            showModal: !this.state.showModal,
            rules: this.state.rules
        })
    }

    handleChange = (event: React.FormEvent<any>) => {
        const target: any = event.target
        this.state.rules.controls[target.name].setValue(target.value)
        this.setState(this.state)
    }

    getError (field: string): string {
        return this.state.rules.controls[field].error
            ? this.state.rules.controls[field].error.message
            : ''
    }

    render () {
        return (
            <NavItem onClick={this.toggle}>
                <NavLink style={{ height: 42 }}>
                    <FontAwesome name='plus' />
                </NavLink>
                <Modal size='sm' isOpen={this.state.showModal}>
                    <ModalHeader>Create Page</ModalHeader>
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
                            onClick={this.close}
                        >Create</Button>
                        <Button color='secondary' onClick={this.toggle}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </NavItem>
        )
    }
}
