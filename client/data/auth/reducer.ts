import { AnyAction } from 'redux'
import { IUser } from 'common/models'
import AuthStore from './model'

const strategy = {
    set_token: (state: AuthStore, payload: string): AuthStore => {
        return { ...state, token: payload }
    },
    set_user: (state: AuthStore, payload: IUser): AuthStore => {
        return { ...state, me: payload }
    },
    set_socket: (state: AuthStore, payload: SocketIOClient.Socket): AuthStore => {
        return { ...state, socket: payload }
    },
    logout: (state: AuthStore, payload: string): AuthStore => {
        return { me: undefined, token: undefined }
    }
}

const possibleActions: string[] = Object.keys(strategy)

export default (state: AuthStore= new AuthStore(), action: AnyAction): AuthStore => {
    if (action.namespace !== 'auth') return state
    if (possibleActions.indexOf(action.type) === -1) return state
    return strategy[action.type](state, action.payload)
}
