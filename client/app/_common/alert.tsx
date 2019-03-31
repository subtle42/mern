import * as React from 'react'
import { Alert } from 'reactstrap'
import NotifActions from 'data/notifications/actions'
import { useAlerts } from './hooks'

interface Props {
    index: number
    duration?: number
    message: string
    type: string
}

const MyAlert: React.FunctionComponent<Props> = (props: Props) => {
    const [isOpen, setOpen] = React.useState(true)

    React.useEffect(() => {
        const myTimeout = setTimeout(() => close(), props.duration || 2000)
        return () => clearTimeout(myTimeout)
    }, [props.index])

    const close = () => {
        setOpen(false)
        setTimeout(() => NotifActions.remove(props.index), 500)
    }

    return <Alert
        color={props.type}
        isOpen={isOpen}
        toggle={() => close()}>
        {props.message}
    </Alert>
}

export const AlertComponent: React.FunctionComponent<any> = () => {
    const alerts = useAlerts()
    return <div style={{
        minWidth: 500,
        marginLeft: -250,
        position: 'fixed',
        zIndex: 1,
        left: '50%',
        top: 30}}>
        {alerts.map((alert, index) => {
            return <MyAlert index={index} key={index} {...alert}></MyAlert>
        })}
    </div>
}
