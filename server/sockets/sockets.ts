import { Document, Model } from 'mongoose'
import { ISharedModel } from '../dbModels'
import * as auth from '../auth/auth.service'
import { Namespace, Socket } from 'socket.io'
import { FastifyInstance } from 'fastify'
import { getWsServer } from '.'
import { WebSocket } from '@fastify/websocket'
import { IBook } from 'server/api/book/model'

type MyChannels = 'addedOrChanged' | 'removed' | 'join' | 'leave'

export abstract class WsBaseSocket<T> {
    private rooms: {[key:string]: WebSocket[]} = {}

    constructor(
        protected server: FastifyInstance,
        private namespace: string,
    ) {

    }

    private send(room: string, channel: MyChannels, data: any[]) {
        if (!this.rooms[room]) {
            this.server.log.error(`Unabel to find room: ${room} in namespace: ${this.namespace}`);
            return
        }
        const msg = JSON.stringify({
            namespace: this.namespace, channel, data
        })
        this.rooms[room].forEach(client => client.send(msg))
    }

    onDelete(room: string, ids: string[]) {
        this.send(room, 'removed', ids)
    }

    onAddOrChange(room: string, data: any[]) {
        this.send(room, 'addedOrChanged', data)
    }

    protected abstract getBook(id: string): Promise<IBook>

    protected abstract getInitState(id: string): Promise<T[]>

    private getAcl (shared: IBook): string[] {
        return [shared.owner].concat(shared.editors, shared.viewers)
    }

    async join(room: string, uId: string, client: WebSocket) {
        const myBook = await this.getBook(room)
                        
        if (myBook && !myBook.isPublic && !this.getAcl(myBook).includes(uId)) {
            return client.send(JSON.stringify({
                error: `You do NOT have access to ${this.namespace}: ${room}`
            }))
        }
        // leave all the existing rooms
        Object.keys(this.rooms).forEach(roomId => {
            if (!this.rooms[roomId].includes(client)) return
            this.rooms[roomId] = this.rooms[roomId].filter(x => x !== client)
        })

        // create list if room does NOT exist yet
        if (!this.rooms[room]) this.rooms[room] = []
        // join room
        this.rooms[room].push(client)
        // send intial list of pages
        client.send(JSON.stringify({
            namespace: this.namespace,
            channel: 'addedOrChanged',
            data: await this.getInitState(room)
        }))
    }
}
