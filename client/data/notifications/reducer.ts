import { AnyAction } from 'redux'

export class NotificationModel {
    type: string
    message: string
    duration?: number
}

export class NotificationStore {
    list: NotificationModel[] = []
}

export const notifReducer = (state: NotificationStore= new NotificationStore(), action: AnyAction): NotificationStore => {
    if (action.namespace !== 'notifications') return state
    if (action.type === 'add') {
        state.list = [...state.list]
        state.list.push(action.payload)
    } else if (action.type === 'remove') {
        state.list = state.list.splice(action.payload, 1)
    }

    return state
}
