import * as React from 'react'
import * as FontAwesome from 'react-fontawesome'
import './style.css'
import Modal from 'reactstrap/lib/Modal'
import { IBook } from 'common/models'
import { BookList } from './edit/list'
import { BookEditForm } from './edit/form'

interface Props {}

export const EditBookButton: React.FunctionComponent<Props> = (props: Props) => {
    const [isOpen, setOpen] = React.useState(false)
    const [toEdit, setEdit] = React.useState(undefined as IBook)

    const getModal = (): JSX.Element => {
        return <Modal isOpen={isOpen}
            size='md'>
            {getContent()}
        </Modal>
    }

    const getContent = (): JSX.Element => {
        if (!toEdit) {
            return <BookList
            onEdit={book => setEdit(book)}
            onDone={() => setOpen(false)} />
        }
        if (toEdit) {
            return <BookEditForm
            _id={toEdit._id}
            onDone={() => setEdit(undefined)} />
        }
    }

    return <div>
        <div className='book-button' onClick={() => setOpen(true)}>
            <FontAwesome style={{ paddingTop: 6 }} size='2x' name='book' />
        </div>
        {getModal()}
    </div>
}
