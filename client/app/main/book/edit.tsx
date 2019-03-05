import * as React from 'react'
import * as FontAwesome from 'react-fontawesome'
import './style.css'
import Modal from 'reactstrap/lib/Modal'
import ModalHeader from 'reactstrap/lib/ModalHeader'
import ModalBody from 'reactstrap/lib/ModalBody'
import ModalFooter from 'reactstrap/lib/ModalFooter'
import Button from 'reactstrap/lib/Button'
import { IBook } from 'common/models'
import { BookList } from './edit/list'
import { BookEditForm } from './edit/form'

interface Props {}

export const EditBookButton: React.StatelessComponent<Props> = (props: Props) => {
    const [isOpen, setOpen] = React.useState(false)
    const [toEdit, setEdit] = React.useState(undefined as IBook)

    const getModal = (): JSX.Element => {
        return <Modal isOpen={isOpen}
            size='lg'>
            <ModalHeader>Library</ModalHeader>
            <ModalBody>
                {getContent()}
            </ModalBody>
            <ModalFooter>
                <Button color='primary'
                    onClick={() => setOpen(false)}>
                    Done
                </Button>
            </ModalFooter>
        </Modal>
    }

    const getContent = (): JSX.Element => {
        if (!toEdit) return <BookList onEdit={book => setEdit(book)}/>
        if (toEdit) return <BookEditForm _id={toEdit._id} />
    }

    return <div>
        <div className='book-button' onClick={() => setOpen(true)}>
            <FontAwesome style={{ paddingTop: 6 }} size='2x' name='book' />
        </div>
        {getModal()}
    </div>
}
