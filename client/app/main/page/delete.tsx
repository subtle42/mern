import * as React from 'react'
import PageActions from 'data/pages/actions'
import NotifActions from 'data/notifications/actions'
import { ConfirmModal } from '../../_common/confirmation'
import * as FontAwesome from 'react-fontawesome'

class Props {
    pageName: string
    _id: string
}

export const DeletePageButton: React.StatelessComponent<Props> = (props: Props) => {
    const removePage = () => {
        PageActions.delete(props._id)
        .then(() => NotifActions.success(`Removed page: ${props.pageName}`))
        .catch(err => NotifActions.error(err.message))
    }

    return <ConfirmModal
        header='Delete Page'
        message={`Are you sure you want to delete: ${props.pageName}?`}>
        <div onClick={removePage}
            style={{ float: 'right' }}>
            <FontAwesome style={{ paddingLeft: 5, paddingTop: 3 }} name='times' />
        </div>
    </ConfirmModal>
}
