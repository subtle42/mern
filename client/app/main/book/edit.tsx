import * as React from 'react'
import * as FontAwesome from 'react-fontawesome'
import Modal from 'reactstrap/lib/Modal'
import SwipeableViews from 'react-swipeable-views'
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

    const getBookEditForm = (): JSX.Element => {
        if (!toEdit) return <div />
        return <BookEditForm
            _id={toEdit._id}
            onDone={() => setEdit(undefined)} />
    }

    const getContent = (): JSX.Element => {
        const index = !toEdit ? 0 : 1

        return <SwipeableViews index={index}>
            <BookList
                onEdit={book => setEdit(book)}
                onDone={() => setOpen(false)} />
            {getBookEditForm()}
        </SwipeableViews>
    }

    return <div>
        <div className='fixed-plugin'
            style={{ top: 190 }}
            onClick={() => setOpen(true)}>
            <FontAwesome style={{ paddingTop: 6 }} size='2x' name='book' />
        </div>
        {getModal()}
    </div>
}
