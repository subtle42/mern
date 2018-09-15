import * as React from 'react'
import { connect } from 'react-redux'
import { Alert } from 'reactstrap'
import { NotificationModel } from 'data/notifications/reducer'
import NotifActions from 'data/notifications/actions'

interface Props {
    alerts: NotificationModel[]
}

class AlertState {
    isOpen: boolean = true
}

interface AlertProps {
    key: number
    duration?: number
    message: string
    type: string
}

class MyAlert extends React.Component<AlertProps, AlertState> {
    state = new AlertState()
    myTimeout

    autoClose () {
        const duration = this.props.duration || 10000
        this.myTimeout = setTimeout(() => this.close(), duration)
    }

    close () {
        clearTimeout(this.myTimeout)
        this.setState({ isOpen: false })
        setTimeout(() => NotifActions.remove(this.props.key), 500)
    }

    render () {
        this.autoClose()
        return <Alert color={this.props.type} isOpen={this.state.isOpen} toggle={this.close}>
            {this.props.message}
        </Alert>
    }
}

const MyComponent: React.StatelessComponent<Props> = (props: Props) => {
    const getAlert = () => {
        if (props.alerts.length === 0) return
        return
    }

    return (<div style={{
        minWidth: 500,
        marginLeft: -250,
        position: 'fixed',
        zIndex: 1,
        left: '50%',
        top: 30
    }}>
        {props.alerts.map((alert, index) => {
            return (<MyAlert key={index} {...alert}></MyAlert>)
        })}
    </div>)
}

export const AlertComponent = connect((store: any) => {
    return {
        alerts: store.notifications ? store.notifications.list : []
    }
})(MyComponent)
