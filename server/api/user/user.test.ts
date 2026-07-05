import { FastifyInstance } from 'fastify'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { after, before, describe, it } from 'node:test'
import { buildMongoDb, buildServer } from 'server/app'

describe('User API', () => {
    const userName = 'test'
    const email = 'test@test.com'
    const password = 'testPass'
    let server: FastifyInstance
    let token: string
    let db!: MongoMemoryServer

    before(async() => {
        server = await buildServer(true)
        db = await buildMongoDb()
    })

    after(async () => {
        await mongoose.disconnect()
        await db.stop({doCleanup: true})
        await server.close()
    })

    describe('post /api/user', () => {
        it('should create a user', async(t) => {
            const res = await server.inject()
                .post('/api/user')
                .body({
                    name: userName,
                    email: email,
                    password: password
                })
            token = JSON.parse(res.body).token
            t.assert.equal(res.statusCode, 200)
        })

        it('should not create a user if the email already exists', async(t) => {
            const res = await server.inject()
                .post('/api/user')
                .body({
                    name: userName,
                    email: email,
                    password: password
                })
            t.assert.notEqual(res.statusCode, 200)
        })
    })

    describe('get /api/user/me', () => {
        const myUser: any = {
            email, name: userName
        }

        it('should return an error user if is NOT logged in', async(t) => {
            const res = await server.inject()
                .get('/api/user/me')
            t.assert.notEqual(res.statusCode, 200)
        })

        it("should get current user's info", async(t) => {
            const res = await server.inject()
                .get('/api/user/me')
                .headers({authorization: token})
            
            t.assert.equal(res.statusCode, 200)
            const user = JSON.parse(res.body)
            t.assert.equal(user.email, myUser.email)
            t.assert.equal(user.name ,myUser.name)
        })
    })
})
