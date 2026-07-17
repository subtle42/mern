import config from '../server/config/environment'
import * as ioClient from 'socket.io-client'
import { IBook, ISource, IPage, IWidget } from 'common/models'
import { FastifyInstance } from 'fastify'
import { buildMongoDb, buildServer } from './app'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { IUser } from './api/user/model'
import { AddressInfo } from 'net'
import { readFileSync } from 'fs'

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
    return {server, tokens, userIds, db}
}

export const testCleanup = async(server: FastifyInstance, db: MongoMemoryServer) => {
    await mongoose.disconnect()
    await db.stop({doCleanup: true})
    await server.close()
}

export const websocketConnect = (app:FastifyInstance, channel: string, token: string) => {
    return ioClient.connect(`${getAddress(app)}/${channel}`, {
        auth: {token}
    })
}

const getAddress = (app:FastifyInstance) => {
    const tmp = app.server.address() as AddressInfo
    return `http://localhost:${tmp.port}`
}

export const createBook = async(app: FastifyInstance, token: string, name: string)=> {
    const res = await app.inject()
        .post(`/api/books`)
        .body({ name })
        .headers({authorization: token})
    return res.body as string
}

export const updateBook = async(app: FastifyInstance, token: string, item: IBook) => {
    await app.inject()
        .put(`/api/books`)
        .body(item)
        .headers({authorization: token})
}

export const createPage = async(app: FastifyInstance, token: string, bookId: string, name: string) => {
    const res = await app.inject()
        .post(`/api/pages`)
        .body({ name, bookId })
        .headers({authorization: token})
    return res.body as string
}

export const createSource = async(app: FastifyInstance, token: string, filePath: string) => {
    const formData = new FormData()
    const blob = new Blob([readFileSync(filePath)], {type: 'plain/text'})
    formData.append('myFile', blob, 'test-file.txt')

    const res = await app.inject()
        .post('/api/sources')
        .payload(formData)
        .headers({authorization: token})
    return res.body as string
}

// export const deleteSource = (token: string, sourceId: string): Promise<void> => {
//     return axios.delete(`${getBaseUrl()}/api/sources/${sourceId}`, setHeader(token))
//     .then(res => res.data as undefined)
// }

export const getSource = async(app: FastifyInstance, token: string, id: string): Promise<ISource> => {
    const res = await app.inject()
        .get(`/api/sources/${id}`)
        .headers({authorization: token})
    return JSON.parse(res.body)
}

export const getBook = async(app: FastifyInstance, token: string, id: string) => {
    const res = await app.inject()
        .get(`/api/books/${id}`)
        .headers({authorization: token})
    return JSON.parse(res.body) as IBook
}

export const getPages = async(app: FastifyInstance, token: string, bookId: string) => {
    const res = await app.inject()
        .get(`${getBaseUrl()}/api/pages/${bookId}`)
        .headers({authorization: token})
    return JSON.parse(res.body) as IPage[]
}

export const deleteBook = async(app: FastifyInstance, token: string, bookId: string) => {
    await app.inject()
        .delete(`/api/books/${bookId}`)
        .headers({authorization: token})
}

export const updatePage = async(app: FastifyInstance, token: string, page: IPage) => {
    await app.inject()
        .put(`/api/pages`)
        .headers({authorization: token})
        .body(page)
}

export const deletePage = async(app: FastifyInstance, token: string, pageId: string) => {
    await app.inject()
        .delete(`/api/pages/${pageId}`)
        .headers({authorization: token})
}

// export const getWidget = (token: string, widgetId: string): Promise<IWidget> => {
//     return axios.get(`${getBaseUrl()}/api/widgets/${widgetId}`, setHeader(token))
//     .then(res => res.data as IWidget)
// }

// export const createWidget = (token: string, pageId: string, sourceId: string, type: string): Promise<string> => {
//     return axios.post(`${getBaseUrl()}/api/widgets`, {
//         pageId,
//         sourceId,
//         type
//     }, setHeader(token))
//     .then(res => res.data as string)
// }

// export const updateWidget = (token: string, widget: IWidget): Promise<void> => {
//     return axios.put(`${getBaseUrl()}/api/widgets`, widget, setHeader(token))
//     .then(res => res.data as undefined)
// }

// export const deleteWidget = (token: string, widgetId: string, pageId: string, bookId: string): Promise<void> => {
//     return axios.delete(`${getBaseUrl()}/api/widgets/${widgetId}/${pageId}/${bookId}`, setHeader(token))
//     .then(res => res.data as undefined)
// }
