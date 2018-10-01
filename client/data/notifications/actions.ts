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
