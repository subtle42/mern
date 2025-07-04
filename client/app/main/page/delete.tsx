import * as React from 'react'
import { ConfirmModal, ConfirmModal2 } from '../../_common/confirmation'
import FontAwesome from 'react-fontawesome'
import Button from 'reactstrap/lib/Button'
import myPageActions from '../../../data/pages/actions'
import { myNotifActions } from '../../../data/notifications/actions'
import { handleAsync } from '../utils'

type Props = {
    pageName: string
    _id: string
}

export const DeletePageButton: React.FunctionComponent<Props> = (props: Props) => {
    const removePage = async() => {
        await myPageActions.delete(props._id)
        await myNotifActions.success(`Removed page: ${props.pageName}`)
        setConfirmOpen(false)
    }
    const [confirmOpen, setConfirmOpen] = React.useState(false)

    return <>
        <Button style={{ margin: '0 0 4 4', padding: '0 2' }}
            onClick={(e) => {
                e.stopPropagation()
                setConfirmOpen(true)
            }}
            size='sm'
            outline
            color='link'>
        <FontAwesome name='times' />
        </Button>
            <ConfirmModal2
                isOpen={confirmOpen}
                header='Delete Page'
                message={`Are you sure you want to delete: ${props.pageName}?`}
                onConfirm={() => removePage()}
                onCancel={() => setConfirmOpen(false)}>

            </ConfirmModal2>
    </>
    

    // return <ConfirmModal
    //     header='Delete Page'
    //     message={`Are you sure you want to delete: ${props.pageName}?`}>
    //     <Button onClick={removePage}
    //         style={{ margin: '0 0 4 4', padding: '0 2' }}
    //         size='sm'
    //         outline
    //         color='link'>
    //         <FontAwesome name='times' />
    //     </Button>
    // </ConfirmModal>
}
