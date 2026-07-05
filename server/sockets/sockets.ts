import { Document } from 'mongoose'
import { ISharedModel } from '../dbModels'
import * as jwt from 'jsonwebtoken'
import config from '../config/environment'
import * as auth from '../auth/auth.service'
import { Namespace, Server, Socket } from 'socket.io'

declare var global: any

export default abstract class BaseSocket {
    protected namespace: Namespace

    constructor (
        protected name: string
    ) {
        // setTimeout(() => {
        //     let myIO: Server = global.myIO

        //     this.namespace = myIO.of(name)
        //     this.setupSocket(name)
        // }, 1000)
    }

    setupSocket (name: string) {
        this.namespace.on('connection', socket => this.onJoin(socket))
        console.debug(`Created socket namespace: ${this.name}`)
    }

    protected abstract getParentId (model: Document): string

    protected abstract getInitialState (room: string): Promise<any[]>

    abstract onAddOrChange (changed: Document | Document[]): void

    abstract onDelete (removed: any | any[]): void

    /**
     * Get the top level shared item for socket permissions
     * @param id
     */
    abstract getSharedModel (id: string): Promise<ISharedModel>

    private onJoin (socket: Socket) {
        socket.on('join', (room: string) => {
            this.veryifyToken(socket.handshake.query.token as string)
            .then(decoded => this.hasViewAccess(decoded, room))
            .then(() => {
                // Leave all rooms
                socket.rooms.forEach(room => socket.leave(room))
                socket.join(room)
                socket.emit('message', `${this.name.toUpperCase()}, joined room: ${room}`)
                return this.getInitialState(room)
            })
            .then(data => this._onAddOrChange(room, data))
            .catch(err => {
                console.error(err)
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

    private hasViewAccess (decodedToken, room: string): Promise<void|boolean> {
        const userId: string = decodedToken._id
        return this.getSharedModel(room)
        .then(shared => auth.hasViewerAccess(userId, shared as any))
    }

    protected _onDelete (room: string, ids: string[]): void {
        this.namespace.in(room).emit('removed', ids)
    }

    protected _onAddOrChange (room: string, items: Document[]): void {
        this.namespace.in(room).emit('addedOrChanged', items)
    }
}
