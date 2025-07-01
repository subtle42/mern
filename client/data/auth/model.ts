import { IUser } from '@mern/server/api/user/model'
import { Socket } from 'socket.io-client'

export default class AuthStore {
    token?: string
    me?: IUser
    socket?: Socket
}
