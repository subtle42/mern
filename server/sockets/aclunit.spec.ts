import 'mocha'
import { stub, spy, SinonStub } from 'sinon'
import { expect } from 'chai'

declare var global
const mySocket = {
    on: spy(),
    leaveAll: spy(),
    join: spy(),
    emit: spy(),
    handshake: {
        query: {
            token: 'test'
        }
    }
}

const emitSpy = spy()

const ofResponse = {
    on: stub().callsFake((myStr, cb) => {
        cb(mySocket)
    }),
    in: stub().returns({
        emit: emitSpy
    })
}

global.myIO = {
    of: stub().returns(ofResponse)
}

import { AclSocket } from './aclSocket'
import * as jwt from 'jsonwebtoken'

describe('AclSocket Base class', () => {
    let verify: SinonStub
    let tmpSocket: AclSocket

    beforeEach(() => {
        verify = stub(jwt, 'verify').callsFake((token, secret, cb: any) => {
            cb(undefined, {
                _id: 'daniel'
            })
        })
    })

    afterEach(() => {
        Object.keys(mySocket).forEach(key => {
            if (key === 'handshake') return
            mySocket[key].resetHistory()
        })
        verify.restore()
        Object.keys(ofResponse).forEach(key => ofResponse[key].resetHistory())
        emitSpy.resetHistory()
    })

    describe('constructor', () => {
        let modelMock: any
        beforeEach(() => {
            modelMock = {
                find: stub().returns({
                    exec: () => new Promise(r => r({}))
                })
            }
        })

        it('should create a namespace base on first input', () => {
            let name = 'asdfasdf'
            tmpSocket = new AclSocket('asdf', modelMock)
            expect(global.myIO.of.calledWith(name))
        })

        it('should call jwt.verify', () => {
            expect(verify.callCount).equals(0)
            tmpSocket = new AclSocket('asdf', modelMock)
            expect(verify.callCount).to.equal(1)
        })

        it('should call socket.join if auth token can be decoded', done => {
            expect(mySocket.join.callCount).equal(0)
            tmpSocket = new AclSocket('asdf', modelMock)
            setTimeout(() => {
                expect(mySocket.join.callCount).equal(1)
                done()
            })
        })

        it('should NOT call socket.join if auth token cannot be decoded', done => {
            verify.resetBehavior()
            verify.callsFake((token, secret, cb) => {
                cb('hello', null)
            })

            expect(mySocket.join.callCount).equals(0)
            tmpSocket = new AclSocket('asdf', modelMock)
            setTimeout(() => {
                expect(mySocket.join.callCount).equals(0)
                done()
            })
        })

        it('should emit the error if auth token cannot be decoded', done => {
            const myErr = 'wafjwjef'

            verify.resetBehavior()
            verify.callsFake((token, secret, cb) => {
                cb(myErr, null)
            })
            expect(mySocket.emit.callCount).equals(0)
            tmpSocket = new AclSocket('asdf', modelMock)
            setTimeout(() => {
                expect(mySocket.emit.calledWith('error', myErr))
                done()
            })
        })
    })

    describe('onAddOrChange', () => undefined)

    describe('onDelete', () => {
        it("should call emit on 'removed' channel if model is public", () => undefined)
        it("should call emit 'removed' for each user in the ACL if model is NOT public", () => undefined)
    })
})
