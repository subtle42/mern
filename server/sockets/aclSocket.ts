import { Model } from 'mongoose'
import { ISharedModel } from 'server/dbModels'
import { FastifyInstance } from 'fastify'
import { IBook } from 'server/api/book/model'
import { WebSocket } from '@fastify/websocket'
import { ISource } from 'server/api/source/model'


export type AclModel = Pick<IBook, 'owner'|'editors'|'isPublic'|'viewers'>
type MyChannels = 'addedOrChanged' | 'removed' | 'join' | 'leave'

export class WsAclSocket {
    private rooms: {[key:string]: WebSocket} = {}

    constructor(
        private server: FastifyInstance,
        private namespace: string,
        protected model: Model<IBook|ISource>,
    ) {}

    getInitialState (userId: string) {
        return this.model.find({
            $or: [
                { owner: userId },
                { editors: userId },
                { viewers: userId },
                { isPublic: true }
            ]
        }).exec()
    }

    join(client: WebSocket, uId: string) {
        this.rooms[uId] = client
    }

    private send(uId: string, channel: MyChannels, data: string[]|AclModel[]) {
        if (!this.rooms[uId]) return this.server.log.error(`Unable to find book client for ${uId}`)
        this.rooms[uId].send(JSON.stringify({
            namespace: this.namespace, channel, data
        }))
    }

    private sendAll(channel: MyChannels, data: any[]) {
        const msg = JSON.stringify({
            namespace: this.namespace, channel, data
        })
        Object.values(this.rooms).forEach(client => {
            client.send(msg, this.server.log.error)
        })
    }

    private getAcl (shared: ISharedModel): string[] {
        return [shared.owner].concat(shared.editors, shared.viewers)
    }

    onDelete (shared: ISharedModel) {
        if (shared.isPublic) {
            return this.sendAll('removed', [shared._id])
        }
        this.getAcl(shared).forEach(uId => this.send(uId, 'removed', [shared._id]))
    }

    onAddOrChange (newShared: IBook|ISource, oldShared?: IBook|ISource) {
        if (!oldShared) {
            this.send(newShared.owner, 'addedOrChanged', [newShared])
        } else if (newShared.isPublic === true) {
            this.sendAll('addedOrChanged', [newShared])
        } else if (oldShared.isPublic === true && newShared.isPublic === false) {
            this.sendAll('removed', [newShared._id])
            this.getAcl(newShared).forEach(uId => this.send(uId, 'addedOrChanged', [newShared]))
        } else {
            const oldAcl = this.getAcl(oldShared)
            const newAcl = this.getAcl(newShared)
            const removed = oldAcl.filter(uId => !newAcl.includes(uId))

            removed.forEach(uId => this.send(uId, 'removed', [newShared._id]))
            this.getAcl(newShared).forEach(uId => this.send(uId, 'addedOrChanged', [newShared]))
        }
    }
}
