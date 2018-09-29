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
    timeout
}

interface AlertProps {
    index: number
    duration?: number
    message: string
    type: string
}

class MyAlert extends React.Component<AlertProps, AlertState> {
    state = new AlertState()

    componentWillMount () {
        const duration = this.props.duration || 2000
        this.setState({
            timeout: setTimeout(() => this.close(), duration)
        })
    }

    close () {
        if (this.state.timeout) clearTimeout(this.state.timeout)
        this.setState({
            isOpen: false,
            timeout: undefined
        })
        setTimeout(() => NotifActions.remove(this.props.index), 500)
    }

    render () {
        return <Alert color={this.props.type} isOpen={this.state.isOpen} toggle={() => this.close()}>
            {this.props.message}
        </Alert>
    }
}

const MyComponent: React.StatelessComponent<Props> = (props: Props) => {
    return (<div style={{
        minWidth: 500,
        marginLeft: -250,
        position: 'fixed',
        zIndex: 1,
        left: '50%',
        top: 30}}>
        {props.alerts.map((alert, index) => {
            return (<MyAlert index={index} key={index} {...alert}></MyAlert>)
        })}
    </div>)
}

export const AlertComponent = connect((store: any) => {
    return {
        alerts: store.notifications ? store.notifications.list : []
    }
})(MyComponent)
