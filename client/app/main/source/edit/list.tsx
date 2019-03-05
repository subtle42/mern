import * as React from 'react'
import * as FontAwesome from 'react-fontawesome'
import ModalHeader from 'reactstrap/lib/ModalHeader'
import ModalBody from 'reactstrap/lib/ModalBody'
import ModalFooter from 'reactstrap/lib/ModalFooter'
import ListGroupItem from 'reactstrap/lib/ListGroupItem'
import Button from 'reactstrap/lib/Button'
import ListGroup from 'reactstrap/lib/ListGroup'

import { ISource } from 'common/models'
import { useSources } from '../../../_common/hooks'
import { ConfirmModal } from '../../../_common/confirmation'
import { store } from 'data/store'
import SourceActions from 'data/sources/actions'
import NotifActions from 'data/notifications/actions'

interface Props {
    onDone: () => void
    onEdit: (source: ISource) => void
}

export const SourceList: React.StatelessComponent<Props> = (props: Props) => {
    const sources = useSources()

    const remove = (source: ISource) => {
        SourceActions.delete(source._id)
        .then(() => NotifActions.success(`Removed source: ${source.title}`))
        .catch(err => NotifActions.error(err.message))
    }

    const getDeleteButton = (source: ISource): JSX.Element => {
        if (source.owner !== store.getState().auth.me._id) return <div/>
        return <ConfirmModal header='Delete Source'
            message={`Are you sure you want to delete: ${source.title}?`}>
            <Button outline
                onClick={() => remove(source)}
                color='danger'
                size='sm'>
                <FontAwesome name='trash'/>
            </Button>
        </ConfirmModal>
    }

    const getEditButton = (source: ISource): JSX.Element => {
        const userId = store.getState().auth.me._id
        if (source.owner !== userId || source.editors.indexOf(userId) !== -1) return <div />
        return <Button outline
            style={{ marginRight: 15 }}
            onClick={() => props.onEdit(source)}
            color='secondary'
            size='sm'>
            <FontAwesome name='edit'/>
        </Button>
    }

    const getList = (): JSX.Element => {
        return <ListGroup>
            {sources.map((source, index) => <ListGroupItem key={index} action>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {source.title}
                    <div>
                        {getEditButton(source)}
                        {getDeleteButton(source)}
                    </div>
                </div>
            </ListGroupItem>)}
        </ListGroup>
    }

    return <div>
        <ModalHeader>Sources</ModalHeader>
        <ModalBody>
            {getList()}
        </ModalBody>
        <ModalFooter>
            <Button color='primary'
                onClick={() => props.onDone()}>
                Done
            </Button>
        </ModalFooter>
    </div>
}
