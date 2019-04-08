import * as jwt from 'jsonwebtoken'
import config from '../../config/environment'
import { Server, Socket } from 'socket.io'

export const socketAuth = (socketServer: Server): void => {
    socketServer.use((socket: Socket, next: Function) => {
        if (socket.handshake.query && socket.handshake.query.token) {
            jwt.verify(socket.handshake.query.token, config.shared.secret, (err, decoded) => {
                if (err) return socket.emit('message', err.message)
                socket.handshake.query.user = decoded
                next()
            })
        }
    })
}
