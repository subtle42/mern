import { Socket } from "socket.io-client"

export class GenericStore {
    list: any[] = []
    socket?: Socket
    selected?: any
}

export const factory = {
    addedOrChanged: (state: GenericStore, payload: any[]): GenericStore => {
        state = { ...state }
        state.list = [...state.list]
        payload.forEach(item => {
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
    select: (state: GenericStore, payload: any): GenericStore => {
        return { ...state, selected: payload }
    },
    removed: (state: GenericStore, payload: string[]): GenericStore => {
        state = { ...state }
        state.list = state.list.filter(item => payload.indexOf(item._id) === -1)
        return state
    },
    storeSocket: (state: GenericStore, payload: Socket): GenericStore => {
        return { ...state, socket: payload }
    },
    disconnect: (state: GenericStore, payload: undefined): GenericStore => {
        return new GenericStore()
    },
    joinRoom: (state: GenericStore, payload: undefined): GenericStore => {
        return { ...state, list: [] }
    }
}
