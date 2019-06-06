import * as React from 'react'
import Modal from 'reactstrap/lib/Modal'
import ModalHeader from 'reactstrap/lib/ModalHeader'
import ModalBody from 'reactstrap/lib/ModalBody'
import ModalFooter from 'reactstrap/lib/ModalFooter'
import Button from 'reactstrap/lib/Button'

interface Props {
    header: string
    message: string
    children?: React.ReactNode
}

export const ConfirmModal: React.FunctionComponent<Props> = (props: Props) => {
    const [isOpen, setOpen] = React.useState(false)
    const newChildren = React.Children.map(props.children, child => {
        return React.cloneElement(child as any, {
            onClick: (event) => open(event)
        })
    })

    const open = (event: React.FormEvent<any>) => {
        if (event) event.stopPropagation()
        setOpen(true)
    }

    const cancel = () => {
        setOpen(false)
    }

    const close = (event: React.FormEvent<any>) => {
        if (event) event.stopPropagation()
        setOpen(false)
        const tmp: any = props.children
        tmp.props.onClick()
    }

    return <span>
        {newChildren}
        <Modal size='sm'
        isOpen={isOpen}
        onClosed={cancel}>
            <ModalHeader>{props.header}</ModalHeader>
            <ModalBody>{props.message}</ModalBody>
            <ModalFooter>
                <Button onClick={cancel} color='secondary'>Cancel</Button>
                <Button onClick={close} color='primary'>Confirm</Button>
            </ModalFooter>
        </Modal>
    </span>
}
