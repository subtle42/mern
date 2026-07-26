import { Document } from 'mongoose'
import { ISharedModel } from '../dbModels'
import * as auth from '../auth/auth.service'
import { Namespace, Socket } from 'socket.io'
import { FastifyInstance } from 'fastify'
import { getWsServer } from '.'


export default abstract class BaseSocket {
    protected namespace: Namespace
    protected myIO = getWsServer()

    constructor (
        protected server: FastifyInstance,
        protected name: string
    ) {
        this.server.log.info(`creating namespace: ${name}`)
        this.namespace = this.myIO.of(name)
        this.namespace.use((socket, next) => {
            const decoded = this.veryifyToken(socket)
            if (decoded) return next()
            return next(new Error("Authentication failed"))
        })
        this.setupSocket()
    }

    setupSocket () {
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
            this.server.log.info(`joined room: ${room}`)
            const decoded = this.veryifyToken(socket)
            
            this.hasViewAccess(decoded, room)
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

    private veryifyToken (socket: Socket) {
        try {
            return this.server.jwt.verify<{_id:string, role:string}>(
                socket.handshake.query.token as string
            )
        }
        catch(err) {
            return undefined
        }
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
