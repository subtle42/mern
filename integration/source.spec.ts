import * as chai from 'chai'
import 'chai-http'
import { ISource } from 'common/models'
import * as utils from './utils'
import * as fs from 'fs'
import * as path from 'path'
const expect = chai.expect

describe('Source API', () => {
    let tokens: string[] = []
    let userIds: string[] = []
    let server: Express.Application

    before(() => {
        return utils.testSetup()
        .then(setup => ({ userIds, tokens, server } = setup))
    })

    after(() => {
        return utils.cleanDb()
    })

    describe('POST /api/sources', () => {
        it('should return an error if user is NOT logged in', () => {
            return chai.request(server)
            .post('/api/sources')
            .send({})
            .then(res => expect(res.status).not.to.equal(200))
        })

        it('should return a string', () => {
            return chai.request(server)
            .post('/api/sources')
            .set('Authorization', tokens[0])
            .attach('file', fs.readFileSync(path.join(__dirname, 'data/2012_SAT_RESULTS.csv')), '2012_SAT_RESULTS.csv')
            .then(res => expect(res.status).to.equal(200))
        })
    })

    describe('PUT /api/sources', () => {
        let sourceId: string
        let mySource: ISource

        before(() => {
            return utils.createSource(tokens[0], path.join(__dirname, 'data/2012_SAT_RESULTS.csv'))
            .then(newId => sourceId = newId)
        })

        beforeEach(() => {
            return utils.getSource(tokens[0], sourceId)
            .then(source => mySource = source)
        })

        it('should return an error if user is NOT logged in', () => {
            return chai.request(server)
            .put('/api/sources')
            .send({})
            .then(res => expect(res.status).to.equal(401))
        })

        it('should return an error if user is NOT owner or editor', () => {
            expect(mySource).not.to.equal(undefined)
            mySource = { ...mySource, title: 'changed' }

            return chai.request(server)
            .put('/api/sources')
            .set('authorization', tokens[1])
            .send(mySource)
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => utils.getSource(tokens[0], sourceId))
            .then(updated => expect(updated.title).not.to.equal('changed'))
        })

        it('should return a success if user is the owner', () => {
            expect(mySource).not.to.equal(undefined)
            expect(mySource.owner).to.equal(userIds[0])
            mySource = { ...mySource, title: 'updated' }

            return chai.request(server)
            .put('/api/sources')
            .set('authorization', tokens[0])
            .send(mySource)
            .then(res => expect(res.status).to.equal(200))
            .then(() => utils.getSource(tokens[0], sourceId))
            .then(updated => expect(updated.title).to.equal('updated'))
        })

        it('should return a success if user is an editor', () => {
            expect(mySource).not.to.equal(undefined)
            expect(mySource.owner).to.equal(userIds[0])
            mySource = { ...mySource }
            mySource.editors.push(userIds[1])

            return chai.request(server)
            .put('/api/sources')
            .set('authorization', tokens[0])
            .send(mySource)
            .then(res => expect(res.status).to.equal(200))
            .then(() => mySource.title = 'new Updated')
            .then(() => chai.request(server)
            .put('/api/sources')
            .set('authorization', tokens[1])
            .send(mySource)
            .then(res => expect(res.status).to.equal(200)))
        })

        it('should return an error if the schema does NOT match', () => {
            expect(mySource).not.to.equal(undefined)
            let tmp: any = mySource
            tmp.size = []
            return chai.request(server)
            .put('/api/sources')
            .set('authorization', tokens[0])
            .send(tmp)
            .then(res => expect(res.status).not.to.equal(200))
        })

        it('should return an error if a user other than the owner tries to change the owner', () => {
            expect(mySource).not.to.equal(undefined)
            expect(mySource.owner).not.to.equal(userIds[1])
            expect(mySource.editors.indexOf(userIds[1])).not.to.equal(-1)
            mySource = { ...mySource }
            mySource.owner = userIds[1]

            return chai.request(server)
            .put('/api/sources')
            .set('authorization', tokens[1])
            .send(mySource)
            .then(res => expect(res.status).not.to.equal(200))
        })

        it('should return a success if the owner changes the owner field', () => {
            expect(mySource.owner).not.to.equal(userIds[1])
            mySource = { ...mySource }
            mySource.owner = userIds[1]

            return chai.request(server)
            .put('/api/sources')
            .set('authorization', tokens[0])
            .send(mySource)
            .then(res => expect(res.status).to.equal(200))
        })
    })

    describe('DELETE /api/sources', () => {
        let sourceId: string
        let socket: SocketIOClient.Socket
        let removedIds: string[] = []

        before(() => {
            socket = utils.websocketConnect('sources', tokens[0])
            socket.on('removed', (ids: string[]) => {
                removedIds = removedIds.concat(ids)
            })

            return utils.createSource(tokens[0], path.join(__dirname, 'data/2012_SAT_RESULTS.csv'))
            .then(newSourceId => sourceId = newSourceId)
        })

        it('should return an error if user is NOT logged in', () => {
            return chai.request(server)
            .del(`/api/sources/${sourceId}`)
            .then(res => expect(res.status).to.equal(401))
            .then(() => expect(removedIds.indexOf(sourceId)).to.equal(-1))
        })

        it('should return an error if record does NOT exist', () => {
            return chai.request(server)
            .del(`/api/sources/ERROR`)
            .set('authorization', tokens[0])
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => expect(removedIds.length).to.equal(0))
        })

        it('should return an error if a user other than owner tries to delete', () => {
            return chai.request(server)
            .del(`/api/sources/${sourceId}`)
            .set('authorization', tokens[1])
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => expect(removedIds.indexOf(sourceId)).to.equal(-1))
        })

        it('should return a success if source exists and user is owner', () => {
            return chai.request(server)
            .del(`/api/sources/${sourceId}`)
            .set('authorization', tokens[0])
            .then(res => expect(res.status).to.equal(200))
        })
    })

    describe('POST /api/sources/query', () => {
        it('should return an error if user is NOT logged in', () => {
            return chai.request(server)
            .post('/api/sources/query')
            .then(res => expect(res.status).not.to.equal(200))
        })

        it('should return records', () => {
            return chai.request(server)
            .post('/api/sources')
            .set('Authorization', tokens[0])
            .attach('file', fs.readFileSync(path.join(__dirname, 'data/2012_SAT_RESULTS.csv')), '2012_SAT_RESULTS.csv')
            .then(res => {
                expect(res.status).to.equal(200)
                return chai.request(server)
                .post('/api/sources/query')
                .set('Authorization', tokens[0])
                .send({
                    sourceId: res.body,
                    measures: [],
                    dimensions: [],
                    filters: []
                })
            })
            .then(res => expect(res.status).to.equal(200))
        })
    })
})
