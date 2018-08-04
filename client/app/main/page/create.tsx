import * as React from 'react'
import { Modal, ModalBody, ModalHeader, ModalFooter, Label, Input, Button, FormGroup, NavItem, NavLink } from 'reactstrap'
import pageActions from 'data/pages/actions'
import * as FontAwesome from 'react-fontawesome'

class State {
    pageName?: string = ''
    showModal?: boolean = false
    validationState?: myStyle = undefined
}

interface Props {
    _id?: string
}

type myStyle = 'success' | 'warning' | 'error'

export class CreatePageButton extends React.Component<Props, State> {
    state: State = new State()

    close = (event) => {
        event.stopPropagation()
        pageActions.create(this.state.pageName.trim())
        .then(pageId => {
            this.setState(new State())
            return pageActions.mySelect(pageId)
        })
    }

    open = () => {
        this.setState({ showModal: true })
    }

    cancel = () => {
        if (event) event.stopPropagation()
        this.setState(new State())
    }

    handleChange = (event: React.FormEvent<any>) => {
        const target: any = event.target
        this.setState({
            [target.name]: target.value,
            validationState: this.getValidationState(target.value)
        })
    }

    getValidationState = (input: string): myStyle => {
        if (input.length < 3) return 'error'
    }

    render () {
        return (
            <NavItem onClick={this.open}>
                <NavLink style={{ height: 42 }}>
                    <FontAwesome name='plus' />
                </NavLink>
                <Modal size='sm' isOpen={this.state.showModal} onClosed={this.cancel}>
                    <ModalHeader>Create Page</ModalHeader>
                    <ModalBody>
                        <FormGroup>
                            <Label>Name:</Label>
                            <Input
                                type='text'
                                value={this.state.pageName}
                                name='pageName'
                                placeholder='Enter Name'
                                onChange={this.handleChange}
                            />
                            {/* {!this.state.validationState || <FormText>Name must be at least 3 characters.</FormText>} */}

                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button color='primary'
                            disabled={!!this.state.validationState || this.state.pageName.length === 0}
                            onClick={this.close}
                        >Create</Button>
                        <Button color='secondary' onClick={this.cancel}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </NavItem>
        )
    }
}
