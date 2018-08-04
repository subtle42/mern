import 'jsdom-global/register'
import { expect } from 'chai'
import { fakeServer, SinonFakeServer } from 'sinon'
import bookActions from './actions'

describe('Book Actions', () => {
    let server: SinonFakeServer

    beforeEach(() => {
        server = fakeServer.create({
            autoRespond: true,
            respondImmediately: true
        })
    })

    afterEach(() => {
        server.restore()
    })

    describe('create function', () => {
        const response = 'alkjewvlkjwav'
        beforeEach(() => {
            server.respondWith('akwflkjawf')
        })

        xit('should make a post request', done => {
            // TODO: still having issues with sending fake requests
            bookActions.create(undefined as any)
            .then(res => {
                expect(res).to.equal(response)
                done()
            })
            .catch(err => console.log(err.message))
        })

        xit('should send the input as the request body', () => undefined)
        xit('should return the response in a promise', () => undefined)
    })

    describe('select function', () => {
        xit('should send a select dispatch', () => undefined)
        xit('should call pageActions.join with the input _id', () => undefined)
    })

    describe('delete function', () => {
        xit('should make a delete request', () => undefined)
        xit('should return a promise void', () => undefined)
    })

    describe('update function', () => {
        xit('should make a put request', () => undefined)
        xit('should send the input as the request body', () => undefined)
        xit('should return a promise void', () => undefined)
    })
})
