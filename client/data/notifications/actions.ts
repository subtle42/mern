import { store } from '../store'

type NotifColors = 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'light'
    | 'dark'

class NotificationActions {
    nameSpace = 'notifications'
    constructor (
        private store
    ) {}

    private dispatch (type: string, payload) {
        return this.store.dispatch({
            type,
            payload,
            namespace: this.nameSpace
        })
    }

    success (message: string, duration?: number): void {
        this.notify('success', message, duration)
    }

    error (message: string, duration?: number): void {
        this.notify('danger', message, duration)
    }

    notify (type: NotifColors, message: string, duration?: number): void {
        this.dispatch('add', {
            message,
            type,
            duration
        })
    }

    remove (index: number) {
        this.dispatch('remove', index)
    }
}

const myActions = new NotificationActions(store)

export default myActions
