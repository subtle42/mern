import { MongoClient } from 'mongodb'
import config from '../server/config/environment'
import axios from 'axios'
import * as jwt from 'jsonwebtoken'
import * as io from 'socket.io-client'
import { App } from '../server/app'
import { IOffer } from 'common/models'

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
    const collections = ['users']
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

export const User = {
    create: (offer: IOffer, token: string): Promise<string> => {
        return axios.post(`${getBaseUrl()}/api/offer`, setHeader(token))
        .then(res => res.data as string)
    },
    update: (offer: IOffer, token: string): Promise<string> => {
        return axios.put(`${getBaseUrl()}/api/offer`, offer, setHeader(token))
        .then(res => res.data as string)
    },
    get: (token: string): Promise<string> => {
        return axios.get(`${getBaseUrl()}/api/offer`, setHeader(token))
        .then(res => res.data as string)
    },
    delete: (id: string, token: string): Promise<string> => {
        return axios.delete(`${getBaseUrl()}/api/offer/${id}`, setHeader(token))
        .then(res => res.data as string)
    }
}

export const Offer = {
    create: (): Promise<string> => {
        return axios.post(`${getBaseUrl()}/api/offer`)
        .then(res => res.data as string)
    },
    update: (): Promise<string> => {
        return axios.put(`${getBaseUrl()}/api/offer`)
        .then(res => res.data as string)
    },
    get: (): Promise<string> => {
        return axios.get(`${getBaseUrl()}/api/offer`)
        .then(res => res.data as string)
    },
    delete: (id: string): Promise<string> => {
        return axios.delete(`${getBaseUrl()}/api/offer/${id}`)
        .then(res => res.data as string)
    }
}
