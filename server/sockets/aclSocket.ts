import { Model } from 'mongoose'
import * as jwt from 'jsonwebtoken'
import config from '../config/environment'
import { Namespace, Socket } from 'socket.io'
import { ISharedModel } from 'server/dbModels'
import { getWsServer } from '.'
import { FastifyInstance } from 'fastify'


export class AclSocket {
    private namespace: Namespace
    private myIO = getWsServer()

    constructor (
        private server: FastifyInstance,
        private name: string,
        protected model: Model<ISharedModel>,
    ) {
        console.log(`creating namespace: ${this.name}`)
        this.namespace = this.myIO.of(this.name)
        console.debug(`Created socket namespace: ${this.name}`)
        this.setupSockEvents()
    }

    private setupSockEvents () {
        this.namespace.on('connection', (socket: Socket) => {
            console.log(`connecting to ${this.name}`)
            const decoded = this.veryifyToken(socket.handshake.query.token as string)
            console.log(`socket verified: ${this.name}`)
            socket.join(decoded._id)
            
            return this.getInitialState(decoded._id)
            .then(data => this.namespace.in(decoded._id).emit('addedOrChanged', data))
            .catch(err => {
                console.error(err)
                socket.emit('message', err)
            })
        })
    }

    private veryifyToken (token: string) {
        console.log('in verify')
        return this.server.jwt.verify<{_id:string, role:string}>(token)
    }

    private getInitialState (userId: string) {
        return this.model.find({
            $or: [{
                owner: userId
            }, {
                editors: userId
            }, {
                viewers: userId
            }, {
                isPublic: true
            }]
        }).exec()
    }

    private getAcl (shared: ISharedModel): string[] {
        return [shared.owner].concat(shared.editors, shared.viewers)
    }

    onDelete (shared: ISharedModel) {
        if (shared.isPublic === true) {
            this.namespace.emit('removed', [shared._id])
        } else {
            this.getAcl(shared).forEach(id => this.namespace.in(id).emit('removed', [shared._id]))
        }
    }

    onAddOrChange (newShared: ISharedModel, oldShared?: ISharedModel) {
        if (!oldShared) {
            this.namespace.in(newShared.owner).emit('addedOrChanged', [newShared])
        } else if (newShared.isPublic === true) {
            this.namespace.emit('addedOrChanged', [newShared])
        } else if (oldShared.isPublic === true && newShared.isPublic === false) {
            this.namespace.emit('removed', [newShared._id])
            this.getAcl(newShared).forEach(id => this.namespace.in(id).emit('addedOrChanged', [newShared]))
        } else {
            const oldAcl = this.getAcl(oldShared)
            const newAcl = this.getAcl(newShared)
            let removed = oldAcl.filter(id => newAcl.indexOf(id) === -1)

            removed.forEach(id => this.namespace.in(id).emit('removed', [newShared._id]))
            this.getAcl(newShared).forEach(id => this.namespace.in(id).emit('addedOrChanged', [newShared]))
        }
    }
}
