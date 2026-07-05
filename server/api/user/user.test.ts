import { FastifyInstance } from 'fastify'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { after, before, describe, it } from 'node:test'
import { testCleanup, testSetup } from 'server/testUtils'

describe('User API', () => {
    const userName = 'test'
    const email = 'test@test.com'
    const password = 'testPass'
    let server: FastifyInstance
    let token: string
    let db!: MongoMemoryServer

    before(async() => {
        ({server, db} = await testSetup())
    })

    after(async () => {
        await testCleanup(server, db)
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
