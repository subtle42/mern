import { Document } from 'mongoose'
import { ISharedModel } from '../dbModels'
import * as jwt from 'jsonwebtoken'
import config from '../config/environment'
import * as auth from '../auth/auth.service'
import { logger } from '../api/utils'

declare var global: any
let myIO: SocketIO.Server = global.myIO

export default abstract class BaseSocket {
    protected namespace: SocketIO.Namespace

    constructor (
        protected name: string
    ) {
        this.namespace = myIO.of(name)
        this.setupSocket(name)
    }

    setupSocket (name: string) {
        this.namespace.on('connection', socket => this.onJoin(socket))
        logger.debug(`Created socket namespace: ${this.name}`)
    }

    protected abstract getParentId (model: Document): string

    protected abstract getInitialState (room: string): Promise<any[]>

    abstract onAddOrChange (changed: Document | Document[]): void

    abstract onDelete (removed: Document | Document[]): void

    /**
     * Get the top level shared item for socket permissions
     * @param id
     */
    abstract getSharedModel (id: string): Promise<ISharedModel>

    private onJoin (socket: SocketIO.Socket) {
        socket.on('join', (room: string) => {
            this.veryifyToken(socket.handshake.query.token)
            .then(decoded => this.hasViewAccess(decoded, room))
            .then(() => {
                if (!(!room || room.length === 0)) {
                    socket.leaveAll()
                    socket.join(room)
                    socket.emit('message', `${this.name.toUpperCase()}, joined room: ${room}`)
                } else {
                    socket.emit('message', `Joined no room.`)
                }
                return this.getInitialState(room)
            })
            .then(data => this._onAddOrChange(room, data))
            .catch(err => {
                logger.error(err)
                socket.emit('message', err)
            })
        })
    }

    private veryifyToken (token: string): Promise<any> {
        return new Promise((resolve, reject) => {
            jwt.verify(token, config.shared.secret, (err, decoded) => {
                if (err) return reject(err)
                resolve(decoded)
            })
        })
    }

    private hasViewAccess (decodedToken, room: string): Promise<void> {
        const userId: string = decodedToken._id
        return this.getSharedModel(room)
        .then(shared => auth.hasViewerAccess(userId, shared))
    }

    protected _onDelete (room: string, ids: string[]): void {
        if (!room) {
            this.namespace.emit('removed', ids)
        } else {
            this.namespace.in(room).emit('removed', ids)
        }
    }

    protected _onAddOrChange (room: string, items: Document[]): void {
        if (!room) {
            this.namespace.emit('addedOrChanged', items)
        } else {
            this.namespace.in(room).emit('addedOrChanged', items)
        }
    }
}
