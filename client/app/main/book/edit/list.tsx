import * as React from 'react'
import * as FontAwesome from 'react-fontawesome'
import Button from 'reactstrap/lib/Button'
import ListGroup from 'reactstrap/lib/ListGroup'
import ListGroupItem from 'reactstrap/lib/ListGroupItem'
import ModalHeader from 'reactstrap/lib/ModalHeader'
import ModalBody from 'reactstrap/lib/ModalBody'
import ModalFooter from 'reactstrap/lib/ModalFooter'

import BookActions from 'data/books/actions'
import NotifActions from 'data/notifications/actions'
import { IBook } from 'common/models'
import { store } from 'data/store'
import { ConfirmModal } from '../../../_common/confirmation'
import { useBooks } from '../../../_common/hooks'

interface Props {
    onEdit: (book: IBook) => void
    onDone: () => void
}

export const BookList: React.StatelessComponent<Props> = (props: Props) => {
    const books = useBooks()

    const remove = (book: IBook) => {
        BookActions.delete(book)
        .then(() => NotifActions.success(`Removed book: ${book.name}`))
        .catch(err => NotifActions.error(err.message))
    }

    const getDeleteButton = (book: IBook): JSX.Element => {
        if (book.owner !== store.getState().auth.me._id) return <div/>
        return <ConfirmModal header='Delete Source'
            message={`Are you sure you want to delete: ${book.name}?`}>
            <Button outline
                onClick={() => remove(book)}
                color='danger'
                size='sm'>
                <FontAwesome name='trash'/>
            </Button>
        </ConfirmModal>
    }

    const getEditButton = (book: IBook): JSX.Element => {
        const userId = store.getState().auth.me._id
        if (book.owner !== userId || book.editors.indexOf(userId) !== -1) return <div />
        return <Button outline
            style={{ marginRight: 15 }}
            onClick={() => props.onEdit(book)}
            color='secondary'
            size='sm'>
            <FontAwesome name='edit'/>
        </Button>
    }

    const getListOfBooks = (): JSX.Element => {
        return <ListGroup>
            {books.map((book, index) => <ListGroupItem
                action
                key={index}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {book.name}
                    <div>
                        {getEditButton(book)}
                        {getDeleteButton(book)}
                    </div>
                </div>
            </ListGroupItem>)}
        </ListGroup>
    }

    return <div>
        <ModalHeader>Library</ModalHeader>
        <ModalBody>
            {getListOfBooks()}
        </ModalBody>
        <ModalFooter>
            <Button color='primary'
                onClick={() => props.onDone()}>
                Done
            </Button>
        </ModalFooter>
    </div>
}
