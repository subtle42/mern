import * as React from 'react'
import * as FontAwesome from 'react-fontawesome'
import Button from 'reactstrap/lib/Button'
import ListGroup from 'reactstrap/lib/ListGroup'
import ListGroupItem from 'reactstrap/lib/ListGroupItem'
import { IBook } from 'common/models'
import { store } from 'data/store'
import { ConfirmModal } from '../../../_common/confirmation'
import { useBooks } from '../../../_common/hooks'

interface Props {
    onEdit: (book: IBook) => void
}

export const BookList: React.StatelessComponent<Props> = (props: Props) => {
    const books = useBooks()

    const remove = () => {
        alert('done')
    }

    const getDeleteButton = (book: IBook): JSX.Element => {
        if (book.owner !== store.getState().auth.me._id) return <div/>
        return <ConfirmModal header='Delete Source'
            message={`Are you sure you want to delete: ${book.name}?`}>
            <Button outline
                onClick={remove}
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

    return <ListGroup>
        {books.map((book, index) => <ListGroupItem
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
