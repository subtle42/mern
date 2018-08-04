
import BaseActions from './baseActions'
import { expect } from 'chai'
import { spy, SinonSpy, stub, SinonStub } from 'sinon'
import * as io from 'socket.io-client'
import store from './store'
import { factory } from './baseReducer'

class TestBaseActions extends BaseActions {
    constructor (store, nameSpace) {
        super(store, nameSpace)
    }

    select (item) {
        return new Promise(resolve => resolve()) as any
    }

    create (input) {
        return new Promise(resolve => resolve('create')) as any
    }

    delete (item): Promise<void> {
        return new Promise(resolve => resolve()) as any
    }

    update (item): Promise<void> {
        return new Promise(resolve => resolve()) as any
    }
}

describe('Base Actions for Redux', () => {
    let store
    let service: BaseActions
    let dispatchResolve: SinonStub
    let namespace: string = 'testing'
    let ioConnect: SinonStub
    let ioOn: SinonStub
    let ioConnectResponse
    let onFnMap = {}

    beforeEach(() => {
        dispatchResolve = stub().returns(new Promise(resolve => resolve()))
        store = {
            dispatch: (params) => {
                return params.then(a => {
                    // console.log("data", a)
                    dispatchResolve(a)
                })
            },
            getState: () => undefined
        }

        ioConnectResponse = {
            on: function (channel, fn) {
                onFnMap[channel] = fn
                return this
            }
        }

        ioConnect = stub(io, 'connect').returns(ioConnectResponse)
        service = new TestBaseActions(store, namespace)
    })

    afterEach(() => {
        ioConnect.restore()
    })

    describe('connection function', () => {
        beforeEach(() => {
            store.getState = stub().returns({
                testing: {}
            })
        })

        it('should connect to its namespace', () => {
            expect(ioConnect.callCount).to.equal(0)
            service.connect('')
            expect(ioConnect.calledWith(`/${namespace}`)).to.equal(true)
        })

        it('should send the input as an auth token to io.connect', done => {
            expect(ioConnect.callCount).to.equal(0)
            const token = 'akfwovjeoije'
            service.connect(token)
            .then(() => {
                expect(ioConnect.calledWith(`/${namespace}`, {
                    query: { token }
                })).to.equal(true)
                done()
            })
        })

        it('should store the connected socket', done => {
            expect(dispatchResolve.callCount).to.equal(0)
            service.connect('')
            .then(() => {
                expect(dispatchResolve.calledWith({
                    type: 'storeSocket',
                    payload: ioConnectResponse,
                    namespace
                })).to.equal(true)
                done()
            })
        })

        it('should return an error if there is already a socket connection', done => {
            store.getState = stub().returns({
                testing: {
                    socket: {}
                }
            })

            service.connect('')
            .catch(err => expect(err).not.to.be.undefined)
            .then(() => done())
        })

        describe('on removed function', () => {
            it("should send a dispatch of 'removed'", done => {
                const input = 'awlkejawf'
                service.connect('')
                .then(() => dispatchResolve.resetHistory())
                .then(() => onFnMap['removed'](input))
                .then(() => {
                    expect(dispatchResolve.callCount).to.equal(1)
                    expect(dispatchResolve.calledWith({
                        type: 'removed',
                        payload: input,
                        namespace
                    })).to.equal(true)
                    done()
                })
            })
        })

        describe('on addedOrChanged function', () => {
            let selectSpy: SinonSpy
            beforeEach(done => {
                selectSpy = spy(service, 'select')
                service.connect('')
                .then(() => dispatchResolve.resetHistory())
                .then(() => done())
            })

            it("should send a dispatch of 'addedOrChanged'", done => {
                const input = [1,2,3]

                onFnMap['addedOrChanged'](input)
                setTimeout(() => {
                    expect(dispatchResolve.calledWith({
                        type: 'addedOrChanged',
                        payload: input,
                        namespace
                    })).to.equal(true)
                    done()
                })
            })

            it('should call select function with the first item from the input if is newList', done => {
                const input = [1,2,3]
                expect(selectSpy.callCount).to.equal(0)
                onFnMap['addedOrChanged'](input)
                setTimeout(() => {
                    expect(selectSpy.callCount).to.equal(1)
                    done()
                })
            })

            it('should NOT call select function if NOT newList', done => {
                const input = [1,2,3]
                onFnMap['addedOrChanged'](input)

                setTimeout(() => {
                    selectSpy.resetHistory()
                    onFnMap['addedOrChanged'](input)
                    setTimeout(() => {
                        expect(selectSpy.callCount).to.equal(0)
                        done()
                    })
                })
            })

            it('should NOT call select function if input length is zero', done => {
                const input = []
                onFnMap['addedOrChanged'](input)
                setTimeout(() => {
                    expect(selectSpy.callCount).to.equal(0)
                    done()
                })
            })
        })
    })

    describe('joinRoom function', () => {
        let emitSpy: SinonSpy
        const room = 'awkjaweawef'
        beforeEach(() => {
            emitSpy = spy()
            let state = {}
            state[namespace] = {
                socket: {
                    emit: emitSpy
                }
            }

            stub(store, 'getState').returns(state)
        })

        it("should send a dispatch of 'joinRoom'", done => {
            expect(dispatchResolve.callCount).to.equal(0)
            service.joinRoom(room)
            .then(() => {
                expect(dispatchResolve.calledWith({
                    type: 'joinRoom',
                    payload: room,
                    namespace
                })).to.equal(true)
                done()
            })
        })

        it("should get a connection and emit the input on channel 'join'", done => {
            expect(emitSpy.callCount).to.equal(0)
            service.joinRoom(room)
            .then(() => {
                expect(emitSpy.callCount).to.equal(1)
                expect(emitSpy.calledWith('join', room)).to.equal(true)
                done()
            })
        })
    })

    describe('disconnect function', () => {
        it('should send a disconnect dispatch', done => {
            let socketSpy = spy()
            stub(store, 'getState').returns({
                'testing': {
                    socket: {
                        disconnect: socketSpy
                    }
                }
            })

            expect(dispatchResolve.callCount).to.equal(0)

            service.disconnect()
            .then(() => {
                expect(socketSpy.callCount).to.equal(1)
                expect(dispatchResolve.calledWith({
                    type: 'disconnect',
                    payload: undefined,
                    namespace
                })).to.equal(true)
                done()
            })
        })
    })
})

describe('Base Reducer', () => {
    let input
    beforeEach(() => input = {
        list: []
    })

    describe('addedOrChanged function', () => {
        xit('should add all items to the list that do NOT already exist', () => undefined)

        xit('should update all items to the list that already exist', () => undefined)

        it('should return a new object', () => {
            const out = factory.addedOrChanged(input, [])
            expect(out).not.to.equal(input)
        })
    })

    describe('select function', () => {
        it('should set the selected attribute with input', () => {
            let selected = 'oiuoiwej'
            const out = factory.select(input, selected)
            expect(out.selected).to.equal(selected)
        })

        it('should return a new object', () => {
            const out = factory.select(input, undefined)
            expect(out).not.to.equal(input)
        })
    })

    describe('removed function', () => {
        it('should remove the input items from input.list', () => {
            input.list = ['1','2','3'].map(index => {
                return { _id: index }
            })
            const out = factory.removed(input, ['2'])
            expect(out.list.length).to.equal(2)
            expect(out.list.filter(x => x._id === '2').length).to.equal(0)
        })

        it('should return a new object', () => {
            const out = factory.removed(input, [])
            expect(out).not.to.equal(input)
        })
    })

    describe('storeSocket function', () => {
        it('should set the socket attribute with input', () => {
            let data = 'wjjqerpvje'
            const out = factory.storeSocket(input, data as any)
            expect(out.socket).to.equal(data)
        })

        it('should return a new object', () => {
            const out = factory.storeSocket(input, undefined)
            expect(out).not.to.equal(input)
        })
    })

    describe('disconnect function', () => {
        it('should resest the socket attribute', () => {
            input.socket = 'awlkej'
            const out = factory.storeSocket(input, undefined)
            expect(out).not.to.equal(input.socket)
        })

        it('should resest the list attribute', () => {
            input.list = 'awlkej'
            const out = factory.storeSocket(input, undefined)
            expect(out).not.to.equal(input.list)
        })

        it('should resest the selected attribute', () => {
            input.selected = 'awlkej'
            const out = factory.storeSocket(input, undefined)
            expect(out).not.to.equal(input.selected)
        })

        it('should return a new object', () => {
            const out = factory.disconnect(input, undefined)
            expect(out).not.to.equal(input)
        })
    })

    describe('joinRoom function', () => {
        it('should set the list to a new array', () => {
            input.list = [1,2,3]
            const out = factory.joinRoom(input, undefined)
            expect(out.list.length).to.equal(0)
        })

        it('should return a new object', () => {
            const out = factory.joinRoom(input, undefined)
            expect(out).not.to.equal(input)
        })
    })
})
