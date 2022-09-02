import { IUser } from 'common/models'
import { Socket } from 'socket.io-client'

export default class AuthStore {
    token?: string
    me?: IUser
    socket?: Socket
}
