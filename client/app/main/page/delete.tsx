import * as React from 'react'
import pageActions from 'data/pages/actions'
import { ConfirmModal } from '../../_common/confirmation'
import * as FontAwesome from 'react-fontawesome'

class State {
    showConfirm: boolean = false
}

class Props {
    pageName: string
    _id: string
}

export class DeletePageButton extends React.Component<Props, State> {
    state: State = new State()

    removePage = () => {
        pageActions.delete(this.props._id)
        .then(() => this.setState(new State()))
    }

    render () {
        return (<ConfirmModal
            header='Delete Page'
            message={`Are you sure you want to delete: ${this.props.pageName}?`}>
            <div onClick={this.removePage}
                style={{ float: 'right' }}>
                <FontAwesome style={{ paddingLeft: 5, paddingTop: 3 }} name='times' />
            </div>
        </ConfirmModal>)
    }
}
