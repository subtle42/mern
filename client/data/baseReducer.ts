import { PayloadAction } from "@reduxjs/toolkit"
import { Socket } from "socket.io-client"

export class GenericStore {
    list: any[] = []
    socket?: Socket
    selected?: any
}

export const factory = {
    addedOrChanged: (state, action: PayloadAction<any[]>) => {
        state = { ...state }
        state.list = [...state.list]
        action.payload.forEach(item => {
            let index = -1
            state.list.forEach((x, i) => {
                if (x._id === item._id) {
                    index = i
                }
            })

            if (index === -1) {
                state.list.push(item)
            } else {
                state.list[index] = item
            }
        })
        return state
    },
    select: (state, {payload}: PayloadAction<string>) => {
        return { ...state, selected: payload }
    },
    remove: (state, {payload}: PayloadAction<string[]>) => {
        state = { ...state }
        state.list = state.list.filter(item => payload.indexOf(item._id) === -1)
        return state
    },
    storeSocket: (state, {payload}: PayloadAction<Socket>) => {
        return { ...state, socket: payload }
    },
    disconnect: (state, {payload}: PayloadAction<void>) => {
        return new GenericStore() as any
    },
    joinRoom: (state, {payload}: PayloadAction<void>) => {
        return { ...state, list: [] }
    }
}
