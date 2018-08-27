import 'mocha'
import { SinonSandbox, createSandbox, SinonFakeServer } from 'sinon'
import AuthActions from './actions'
import { expect } from 'chai'
import store from 'data/store'

describe('AuthActions', () => {
    const sandbox: SinonSandbox = createSandbox({})
    const url: string = '/api/user'
    let server: SinonFakeServer

    before(() => {
        server = sandbox.useFakeServer()
        server.respondImmediately = true
        server.autoRespond = true
    })

    afterEach(() => {
        server.requests = []
        store.dispatch({
            type: 'RESET'
        })
    })

    after(() => {
        sandbox.restore()
        server.restore()
    })

    describe('create function', () => {
        it('should return a the new user id', done => {
            const user: any = {}
            const userId = 'lwejflkwejrvler'
            server.respondWith('POST', url, userId)

            AuthActions.create(user)
            .then(res => expect(res).to.equal(userId))
            .then(() => done())
        })

        it('should send the input as the request body', done => {
            const user = {
                email: 'email',
                name: 'name',
                password: 'password'
            }
            server.respondWith('POST', url, 'userId')

            AuthActions.create(user)
            .then(() => expect(server.requests[0].requestBody).to.equal(JSON.stringify(user)))
            .then(() => done())
        })
    })

    describe('update function', () => {
        it('should send the input as the request body', done => {
            const data: any = {
                a: 'awefawefawe',
                b: 'wqerqwer'
            }
            server.respondWith('PUT', url, '')

            AuthActions.update(data)
            .then(() => expect(server.requests[0].requestBody).to.equal(JSON.stringify(data)))
            .then(() => done())
        })

        it('should send the input response to the store', done => {
            const data: any = {
                a: 'awefawefawe',
                b: 'wqerqwer'
            }
            server.respondWith('PUT', url, '')

            AuthActions.update(data)
            .then(() => expect(store.getState().auth.me).to.equal(data))
            .then(() => done())
        })

        it('do nothing to the store on failure', done => {
            server.respondWith('PUT', url, [401, '', ''])
            expect(store.getState().auth.me).to.equal(undefined)

            AuthActions.update({} as any)
            .catch(() => expect(store.getState().auth.me).to.equal(undefined))
            .then(() => done())
        })
    })

    describe('preload function', () => {
        xit('should do nothing if auth token is NOT in cookies', () => undefined)
        xit('should set axios auth header', () => undefined)
    })
    describe('login function', () => undefined)
    describe('logout function', () => undefined)

})
