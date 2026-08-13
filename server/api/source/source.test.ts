import {describe, before, after, it, beforeEach} from 'node:test'
import { ISource } from 'common/models'
import * as fs from 'fs'
import { FastifyInstance } from 'fastify'
import { TestEnv, testSetup } from 'server/testUtils'

describe('Source API', () => {
    let server: FastifyInstance
    let utils: TestEnv
    let tokens: string[] = []
    let userIds: string[] = []

    before(async() => {
        ({server, utils, userIds, tokens} = await testSetup())
    })

    after(async() => {
        await utils.cleanup()
    })

    describe('POST /api/sources', () => {
        it('should return an error if user is NOT logged in', async(t) => {
            const res = await server.inject()
                .post('/api/sources')
                .body({})
            t.assert.notEqual(res.statusCode, 200)
        })

        it('should return a string', async(t) => {
            const formData = new FormData()
            const blob = new Blob([fs.readFileSync('../integration/data/2012_SAT_RESULTS.csv')], {type: 'plain/text'})
            formData.append('file', blob, '2012_SAT_RESULTS.csv')

            const res = await server.inject()
                .post('/api/sources')
                .payload(formData)
                .headers({authorization: tokens[0]})
            t.assert.equal(res.statusCode, 200)
        })
    })

    describe('PUT /api/sources', () => {
        let sourceId: string
        let mySource: ISource

        before(async() => {
            sourceId = await utils.source.create(tokens[0], '../integration/data/2012_SAT_RESULTS.csv')
        })

        beforeEach(async() => {
            mySource = await utils.source.get(tokens[0], sourceId)
        })

        it('should return an error if user is NOT logged in', async(t) => {
            const res = await server.inject()
                .put('/api/sources')
                .body({})
            t.assert.equal(res.statusCode, 401)
        })

        it('should return an error if user is NOT owner or editor', async(t) => {
            t.assert.notEqual(mySource, undefined)
            mySource = { ...mySource, title: 'changed' }

            const res = await server.inject()
                .put('/api/sources')
                .headers({authorization: tokens[1]})
                .body(mySource)
            t.assert.notEqual(res.statusCode, 200)
            const updated = await utils.source.get(tokens[0], sourceId)
            t.assert.notEqual(updated.title, mySource.title)
        })

        it('should return a success if user is the owner', async(t) => {
            t.assert.notEqual(mySource, undefined)
            t.assert.equal(mySource.owner, userIds[0])
            mySource = { ...mySource, title: 'updated' }

            const res = await server.inject()
                .put('/api/sources')
                .headers({authorization: tokens[0]})
                .body(mySource)
            t.assert.equal(res.statusCode, 200)
            const updated = await utils.source.get(tokens[0], sourceId)
            t.assert.equal(updated.title, mySource.title)
        })

        it('should return a success if user is an editor', async(t) => {
            t.assert.notEqual(mySource, undefined)
            t.assert.equal(mySource.owner, userIds[0])
            mySource = { ...mySource }
            mySource.editors.push(userIds[1])

            const res = await server.inject()
                .put('/api/sources')
                .headers({authorization: tokens[0]})
                .body(mySource)
            t.assert.equal(res.statusCode, 200)
            mySource.title = 'new Updated'

            const res2 = await server.inject()
                .put('/api/sources')
                .headers({authorization: tokens[1]})
                .body(mySource)
            t.assert.equal(res2.statusCode, 200)
        })

        it('should return an error if the schema does NOT match', async(t) => {
            t.assert.notEqual(mySource, undefined)
            let tmp: any = mySource
            tmp.size = []

            const res = await server.inject()
                .put('/api/sources')
                .headers({authorization: tokens[0]})
                .body(tmp)
            t.assert.notEqual(res.statusCode, 200)
        })

        it('should return an error if a user other than the owner tries to change the owner', async(t) => {
            t.assert.notEqual(mySource, undefined)
            t.assert.notEqual(mySource.owner, userIds[1])
            t.assert.equal(mySource.editors.includes(userIds[1]), true)
            mySource = { ...mySource }
            mySource.owner = userIds[1]

            const res = await server.inject()
                .put('/api/sources')
                .headers({authorization: tokens[1]})
                .body(mySource)
            t.assert.notEqual(res.statusCode, 200)
        })

        it('should return a success if the owner changes the owner field', async(t) => {
            t.assert.notEqual(mySource.owner, userIds[1])
            mySource = { ...mySource }
            mySource.owner = userIds[1]

            const res = await server.inject()
                .put('/api/sources')
                .headers({authorization: tokens[0]})
                .body(mySource)
            t.assert.equal(res.statusCode, 200)
        })
    })

    describe('DELETE /api/sources', () => {
        let sourceId: string
        // let socket: SocketIOClient.Socket
        // let removedIds: string[] = []

        before(async() => {
            sourceId = await utils.source.create(tokens[0], '../integration/data/2012_SAT_RESULTS.csv')
        })

        it('should return an error if user is NOT logged in', async(t) => {
            const res = await server.inject()
                .delete(`/api/sources/${sourceId}`)
            t.assert.equal(res.statusCode, 401)
        })

        it('should return an error if record does NOT exist', async(t) => {
            const res = await server.inject()
                .delete(`/api/sources/ERROR`)
                .headers({authorization: tokens[0]})
            t.assert.notEqual(res.statusCode, 200)
        })

        it('should return an error if a user other than owner tries to delete', async(t) => {
            const res = await server.inject()
                .delete(`/api/sources/${sourceId}`)
                .headers({authorization: tokens[1]})
            t.assert.notEqual(res.statusCode, 200)
        })

        it('should return a success if source exists and user is owner', async(t) => {
            const res = await server.inject()
                .delete(`/api/sources/${sourceId}`)
                .headers({authorization: tokens[0]})
            t.assert.equal(res.statusCode, 200)
        })
    })

    describe('POST /api/sources/query', () => {
        it('should return an error if user is NOT logged in', async(t) => {
            const res = await server.inject()
                .post('/api/sources/query')
            t.assert.notEqual(res.statusCode, 200)
        })

        it.skip('should return records', () => {
            // return chai.request(server)
            // .post('/api/sources')
            // .set('Authorization', tokens[0])
            // .attach('file', fs.readFileSync(path.join(__dirname, 'data/2012_SAT_RESULTS.csv')), '2012_SAT_RESULTS.csv')
            // .then(res => {
            //     expect(res.status).to.equal(200)
            //     return chai.request(server)
            //     .post('/api/sources/query')
            //     .set('Authorization', tokens[0])
            //     .send({
            //         sourceId: res.body,
            //         measures: [],
            //         dimensions: [],
            //         filters: []
            //     })
            // })
            // .then(res => expect(res.status).to.equal(200))
        })
    })
})
