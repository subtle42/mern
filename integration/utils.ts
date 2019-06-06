import { MongoClient } from 'mongodb'
import config from '../server/config/environment'
import axios from 'axios'
import * as jwt from 'jsonwebtoken'
import * as io from 'socket.io-client'
import { IBook, ISource, IPage, IWidget } from 'common/models'
import { App } from '../server/app'

// Need to keep this to inject chai with http requests
const chai = require('chai')
const chaiHttp = require('chai-http')
chai.use(chaiHttp)

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

export const decodeToken = (token: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, config.shared.secret, (err, decoded: any) => {
            if (err) return reject(err)
            resolve(decoded)
        })
    })
}

const removeDbRecords = (collectionName: string): Promise<void> => {
    return MongoClient.connect(`mongodb://${config.db.mongoose.app.host}:${config.db.mongoose.app.port}`)
    .then(client => {
        return client.db(config.db.mongoose.app.dbname)
        .collection(collectionName)
        .deleteMany({})
        .then(res => client.close(true))
    })
}

const removeDataDb = (): Promise<void> => {
    return MongoClient.connect(`mongodb://${config.db.mongoose.data.host}:${config.db.mongoose.data.port}`)
    .then(client => {
        return client.db(config.db.mongoose.data.dbname).dropDatabase()
        .then(() => client.close())
    })
}

export const cleanDb = (): Promise<void> => {
    const collections = ['users', 'books', 'pages', 'widgets', 'sources']
    return Promise.all(collections.map(name => removeDbRecords(name)))
    .then(() => removeDataDb())
}

interface MySetup {
    tokens: string[]
    userIds: string[]
    server: Express.Application
}

export const getUserIdFromToken = (tokens: string[]) => {
    return Promise.all(tokens.map(token => decodeToken(token)))
    .then(decoded => decoded.map(item => item._id))
}

export const createUserAndLogin = (user: FakeUser): Promise<string> => {
    return axios.post(`${getBaseUrl()}/api/user`, user)
    .then(res => axios.post(`${getBaseUrl()}/api/auth/local`, user))
    .then(res => res.data.token as string)
}

export const createAllUsers = () => {
    return Promise.all(USERS.map(user => createUserAndLogin(user)))
}

export const testSetup = (): Promise<MySetup> => {
    let setup: MySetup = {
        tokens: [],
        userIds: [],
        server: App.express
    }
    return cleanDb()
    .then(() => createAllUsers())
    .then(tokens => setup.tokens = tokens)
    .then(tokens => getUserIdFromToken(tokens))
    .then(ids => setup.userIds = ids)
    .then(() => setup)
}

const setHeader = (token: string) => {
    return {
        headers: {
            authorization: token
        }
    }
}

export const websocketConnect = (channel: string, token: string): SocketIOClient.Socket => {
    return io.connect(`${getBaseUrl()}/${channel}`, {
        query: { token }
    })
}

export const createBook = (token: string, name: string): Promise<string> => {
    return axios.post(`${getBaseUrl()}/api/books`, { name }, setHeader(token))
    .then(res => res.data as string)
}

export const updateBook = (token: string, item: IBook): Promise<void> => {
    return axios.put(`${getBaseUrl()}/api/books`, item, setHeader(token))
    .then(res => res.data as undefined)
}

/**
 * Will create a page and return it's id
 * @param token
 * @param bookId
 * @param name
 */
export const createPage = (token: string, bookId: string, name: string): Promise<string> => {
    return axios.post(`${getBaseUrl()}/api/pages`, { name, bookId }, setHeader(token))
    .then(res => res.data as string)
}

export const createSource = (token: string, filePath: string): Promise<string> => {
    return chai.request(getBaseUrl())
    .post('/api/sources')
    .set('authorization', token)
    .attach('file', filePath, 'myFile.csv')
    .then(res => res.body as string)
}

export const deleteSource = (token: string, sourceId: string): Promise<void> => {
    return axios.delete(`${getBaseUrl()}/api/sources/${sourceId}`, setHeader(token))
    .then(res => res.data as undefined)
}

export const getSource = (token: string, id: string): Promise<ISource> => {
    return axios.get(`${getBaseUrl()}/api/sources/${id}`, setHeader(token))
    .then(res => res.data as ISource)
}

export const getBook = (token: string, id: string): Promise<IBook> => {
    return axios.get(`${getBaseUrl()}/api/books/${id}`, setHeader(token))
    .then(res => res.data as IBook)
}

export const getPages = (token: string, bookId: string): Promise<IPage[]> => {
    return axios.get(`${getBaseUrl()}/api/pages/${bookId}`, setHeader(token))
    .then(res => res.data as IPage[])
}

export const deleteBook = (token: string, bookId: string): Promise<void> => {
    return axios.delete(`${getBaseUrl()}/api/books/${bookId}`, setHeader(token))
    .then(res => res.data as undefined)
}

export const updatePage = (token: string, page: IPage): Promise<void> => {
    return axios.put(`${getBaseUrl()}/api/pages`, page, setHeader(token))
    .then(res => res.data as undefined)
}

export const deletePage = (token: string, pageId: string): Promise<void> => {
    return axios.delete(`${getBaseUrl()}/api/pages/${pageId}`, setHeader(token))
    .then(res => res.data as undefined)
}

export const getWidget = (token: string, widgetId: string): Promise<IWidget> => {
    return axios.get(`${getBaseUrl()}/api/widgets/${widgetId}`, setHeader(token))
    .then(res => res.data as IWidget)
}

export const createWidget = (token: string, pageId: string, sourceId: string, type: string): Promise<string> => {
    return axios.post(`${getBaseUrl()}/api/widgets`, {
        pageId,
        sourceId,
        type
    }, setHeader(token))
    .then(res => res.data as string)
}

export const updateWidget = (token: string, widget: IWidget): Promise<void> => {
    return axios.put(`${getBaseUrl()}/api/widgets`, widget, setHeader(token))
    .then(res => res.data as undefined)
}

export const deleteWidget = (token: string, widgetId: string, pageId: string, bookId: string): Promise<void> => {
    return axios.delete(`${getBaseUrl()}/api/widgets/${widgetId}/${pageId}/${bookId}`, setHeader(token))
    .then(res => res.data as undefined)
}
