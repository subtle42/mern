import { ModalHeader, ModalBody, ModalFooter, Modal, Button } from 'reactstrap'
import * as React from 'react'

interface Props {
    header: string
    message: string
}

class State {
    showModal: boolean = false
}

export class ConfirmModal extends React.Component<Props, State> {
    state: State = new State()
    // Copying children and replacing click event
    newChildren = React.Children.map(this.props.children, child => {
        return React.cloneElement(child as any, {
            onClick: (event) => this.open(event)
        })
    })

    open = (event) => {
        if (event) event.stopPropagation()
        this.setState({ showModal: true })
    }

    cancel = () => {
        this.setState(new State())
    }

    close = (event) => {
        if (event) event.stopPropagation()
        this.setState(new State())
        const tmp: any = this.props.children
        tmp.props.onClick()
    }

    render () {
        return (<span>
            {this.newChildren}
            <Modal size='sm'
            isOpen={this.state.showModal}
            onClosed={this.cancel}>
                <ModalHeader>{this.props.header}</ModalHeader>
                <ModalBody>{this.props.message}</ModalBody>
                <ModalFooter>
                    <Button onClick={this.cancel} color='secondary'>Cancel</Button>
                    <Button onClick={this.close} color='primary'>Confirm</Button>
                </ModalFooter>
            </Modal>
        </span>)
    }
}
