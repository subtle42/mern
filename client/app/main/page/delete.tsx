import * as React from 'react'
import PageActions from 'data/pages/actions'
import NotifActions from 'data/notifications/actions'
import { ConfirmModal } from '../../_common/confirmation'
import * as FontAwesome from 'react-fontawesome'
import Button from 'reactstrap/lib/Button'

class Props {
    pageName: string
    _id: string
}

export const DeletePageButton: React.FunctionComponent<Props> = (props: Props) => {
    const removePage = () => {
        PageActions.delete(props._id)
        .then(() => NotifActions.success(`Removed page: ${props.pageName}`))
        .catch(err => NotifActions.error(err.message))
    }

    return <ConfirmModal
        header='Delete Page'
        message={`Are you sure you want to delete: ${props.pageName}?`}>
        <Button onClick={removePage}
            style={{ margin: '0 0 4 4', padding: '0 2' }}
            size='sm'
            outline
            color='link'>
            <FontAwesome name='times' />
        </Button>
    </ConfirmModal>
}
