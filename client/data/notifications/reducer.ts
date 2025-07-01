import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AnyAction } from 'redux'

export type NotificationModel = {
    type: string
    message: string
    duration?: number
}

export class NotificationStore {
    list: NotificationModel[] = []
}

export const NotifSlice = createSlice({
    name: 'notifications',
    initialState: new NotificationStore(),
    reducers: {
        add: (state, {payload}: PayloadAction<NotificationModel>) => {
            state.list = [...state.list]
            state.list.push(payload)
            return state
        },
        remove: (state, {payload}: PayloadAction<number>) => {
            state.list = state.list.splice(payload, 1)
            return state
        }
    }
})
