import 'mocha'
import { expect } from 'chai'
import { spy, SinonSpy, stub, SinonStub } from 'sinon'
import * as passport from 'passport'
import * as tokenService from '../auth.service'
import auth from './passport'
import config from '../../config/environment'

describe('Local Auth', () => {
    let authenticate: SinonStub
    let next: SinonSpy
    let mySignToken: SinonSpy
    let res

    beforeEach(() => {
        mySignToken = spy(tokenService, 'signToken')
        authenticate = stub(passport, 'authenticate')
        next = spy()
        res = {
            status: stub().returns({
                json: spy()
            }),
            json: spy()
        }
    })

    afterEach(() => {
        authenticate.restore()
        mySignToken.restore()
    })

    describe('Authenticate', () => {
        it("should set the first arg to 'local'", done => {
            authenticate.callsFake((type, cb) => {
                expect(type).to.equal('local')
                done()
            })

            auth.authenticate(null, null, next)
        })

        it('should send back a 401 if there is an error', done => {
            let err = 'awoejfowajef'
            authenticate.callsFake((type, cb) => {
                cb(err, null)
                done()
            })
            auth.authenticate(null, res, next)
            expect(res.status.calledWith(401)).equals(true)
        })

        it('should send back a 404 if there is no error but no data', done => {
            authenticate.callsFake((type, cb) => {
                cb(undefined, undefined)
                done()
            })
            auth.authenticate(null, res, next)
            expect(res.status.calledWith(404)).equals(true)
        })

        it('should call signToken with user._id and and user.role', done => {
            const user = {
                _id: 'aaaaaaaa',
                role: 'bbbbbbbbbb'
            }
            authenticate.callsFake((type, cb) => {
                cb(undefined, user)

                expect(mySignToken.calledWith(user._id, user.role)).equals(true)
                done()
            })
            auth.authenticate(null, res, next)
        })

        it('should call res.json with the generated token from signToken', done => {
            const test = 'awefjwelfj'
            const user = {
                _id: 'aaaaaaaa',
                role: 'bbbbbbbbbb'
            }
            authenticate.callsFake((type, cb) => {
                cb(undefined, user)
                expect(res.json.callCount).equals(1)
                done()
            })

            auth.authenticate(null, res, next)
        })
    })

    describe('Setup', () => undefined)
})
