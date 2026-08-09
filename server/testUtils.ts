import config from '../server/config/environment'
import { FastifyInstance } from 'fastify'
import { buildMongoDb, buildServer } from './app'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { IUser } from './api/user/model'
import { readFileSync } from 'fs'
import { IBook } from './api/book/model'
import { IPage } from './api/page/model'
import { IWidget } from './api/widget/model'
import { ISource } from './api/source/model'
import { WebSocket } from '@fastify/websocket'

interface FakeUser {
    email: string
    password: string
    name: string
}

export const USERS: FakeUser[] = [{
    email: 'test1@test.com',
    password: 'test1',
    name: 'Test1'
}, {
    email: 'test2@test.com',
    password: 'test2',
    name: 'Test2'
}, {
    email: 'test3@test.com',
    password: 'test3',
    name: 'Test3'
}]

export const getBaseUrl = (): string => {
    return `${config.server.protocol}://${config.server.location}:${config.server.port}`
}

export const getUserIdFromToken = (app: FastifyInstance, tokens: string[]): string[] => {
    return tokens.map(token => app.jwt.verify<IUser>(token)._id)
}

export const createUserAndLogin = async(app: FastifyInstance, user: FakeUser): Promise<string> => {
    await app.inject().post('/api/user').body(user)
    const res = await app.inject().post('/api/auth/local').body(user)
    return JSON.parse(res.body).token as string
}

export const createAllUsers = (app: FastifyInstance) => {
    return Promise.all(USERS.map(user => createUserAndLogin(app, user)))
}

export const testSetup = async() => {
    const db = await buildMongoDb()
    const server = await buildServer(true)
    const tokens = await createAllUsers(server)
    const userIds = getUserIdFromToken(server, tokens)
    await server.listen()
    await server.ready()
    return {server, tokens, userIds, utils: new TestEnv(server, db)}
}

export class TestEnv {
    constructor(
        private app: FastifyInstance,
        private db: MongoMemoryServer
    ) {}

    websocketConnect(token: string) {
        return this.app.injectWS(`/ws?token=${token}`)
    }

    async cleanup() {
        await mongoose.disconnect()
        await this.db.stop({doCleanup: true})
        await this.app.close()
    }

    readonly book = {
        create: async(token: string, name: string) => {
            const res = await this.app.inject()
                .post(`/api/books`)
                .body({ name })
                .headers({authorization: token})
            return res.body as string
        },
        update: async(token: string, item: IBook) => {
            await this.app.inject()
                .put(`/api/books`)
                .body(item)
                .headers({authorization: token})
        },
        get: async(token: string, id: string) => {
            const res = await this.app.inject()
                .get(`/api/books/${id}`)
                .headers({authorization: token})
            return JSON.parse(res.body) as IBook
        },
        remove: async(token: string, bookId: string) => {
            await this.app.inject()
                .delete(`/api/books/${bookId}`)
                .headers({authorization: token})
        }
    }

    readonly page = {
        create: async(token: string, bookId: string, name: string) => {
            const res = await this.app.inject()
                .post(`/api/pages`)
                .body({ name, bookId })
                .headers({authorization: token})
            return res.body as string
        },
        update: async(token: string, page: IPage) => {
            await this.app.inject()
                .put(`/api/pages`)
                .headers({authorization: token})
                .body(page)
        },
        get: async(token: string, bookId: string) => {
            const res = await this.app.inject()
                .get(`${getBaseUrl()}/api/pages/${bookId}`)
                .headers({authorization: token})
            return JSON.parse(res.body) as IPage[]
        },
        remove: async(token: string, pageId: string) => {
            await this.app.inject()
                .delete(`/api/pages/${pageId}`)
                .headers({authorization: token})
        }
    }

    readonly widget = {
        create: async(token: string, pageId: string, sourceId: string, type: string) => {
            const res = await this.app.inject()
                .post('/api/widgets')
                .body({pageId, sourceId, type})
                .headers({authorization: token})
            return res.body as string
        },
        update: async(token: string, widget: IWidget) => {
            const res = await this.app.inject()
                .put('/api/widgets')
                .headers({authorization: token})
                .body(widget)
        },
        get: async(token: string, widgetId: string) => {
            const res = await this.app.inject()
                .get(`/api/widgets/${widgetId}`)
                .headers({authorization: token})
            return JSON.parse(res.body) as IWidget
        },
        remove: async(token: string, widgetId: string, pageId: string, bookId: string) => {
            const res = await this.app.inject()
                .delete(`/api/widgets/${widgetId}/${pageId}/${bookId}`)
                .headers({authorization: token})
        }
    }

    readonly source = {
        create: async(token: string, filePath: string) => {
            const formData = new FormData()
            const blob = new Blob([readFileSync(filePath)], {type: 'plain/text'})
            formData.append('myFile', blob, 'test-file.txt')

            const res = await this.app.inject()
                .post('/api/sources')
                .payload(formData)
                .headers({authorization: token})
            return res.body as string
        },
        get: async(token: string, id: string) => {
            const res = await this.app.inject()
                .get(`/api/sources/${id}`)
                .headers({authorization: token})
            return JSON.parse(res.body) as ISource
        }
    }
}

export const getWsMessage = async<T>(socket: WebSocket, opts: {channel:string, namespace: string}): Promise<T> => {
    return new Promise(resolve => {
        socket.on('message', ev => {
            const {channel, namespace, data} = JSON.parse(ev.toString())
            if (namespace !== opts.namespace) return
            if (channel !== opts.channel) return
            resolve(data)
        })
    })
}
