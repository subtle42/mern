
import { expect, assert } from 'chai'
import { SinonSpy, SinonStub, SinonSandbox, createSandbox } from 'sinon'
import { Store, createStore, combineReducers, applyMiddleware } from 'redux'
import promiseMiddleware from 'redux-promise'

import { factory } from './baseReducer'
import BaseActions from './baseActions'

const namespace: string = 'testing'
const myReducer = (state = { list: [] }, action) => {
    if (Object.keys(factory).indexOf(action.type) === -1) return state
    return factory[action.type](state, action.payload)
}

class TestBaseActions extends BaseActions {
    constructor (store, nameSpace) {
        super(store, nameSpace)
    }

    select (item) {
        return new Promise(resolve => resolve(undefined)) as any
    }

    create (input) {
        return new Promise(resolve => resolve('create')) as any
    }

    delete (item): Promise<void> {
        return new Promise(resolve => resolve(undefined)) as any
    }

    update (item): Promise<void> {
        return new Promise(resolve => resolve(undefined)) as any
    }
}

describe('Base Actions for Redux', () => {
    let service: BaseActions
    let sandbox: SinonSandbox
    let onFnMap = {}
    let store: Store
    let connectStub: SinonStub

    beforeEach(() => {
        store = createStore(combineReducers({
            [namespace]: myReducer
        }), applyMiddleware(promiseMiddleware))

        sandbox = createSandbox({})
        service = new TestBaseActions(store, namespace)

        return import('socket.io-client')
        .then(io => connectStub = sandbox.stub(io, 'connect').returns({
            on: function (channel, fn) {
                onFnMap[channel] = fn
                return this
            },
            emit: sandbox.spy(),
            disconnect: sandbox.spy()
        } as any))
    })

    afterEach(() => {
        sandbox.restore()
    })

    describe('connection function', () => {
        const token: string = 'akfwovjeoije'
        beforeEach(() => {
            return service.connect(token)
        })

        it('should connect to its namespace', () => {
            assert(connectStub.calledWith(`/${namespace}`))
        })

        it('should send the input as an auth token to io.connect', () => {
            assert(connectStub.calledWith(`/${namespace}`, {
                query: { token }
            }))
        })

        it('should store the connected socket', () => {
            expect(store.getState()[namespace].socket).not.to.equal(undefined)
        })

        it('should return an error if there is already a socket connection', () => {
            return service.connect('')
            .catch(err => err)
            .then(err => expect(err).not.to.be.undefined)
        })

        describe('on removed function', () => {
            it("should send a dispatch of 'removed'", () => {
                const input = 'awlkejawf'
                const mySpy = sandbox.spy()
                sandbox.stub(store, 'dispatch')
                .callsFake((input => input.then(data => {
                    mySpy(data)
                    return data
                })) as any)

                return onFnMap['removed'](input)
                .then(() => expect(mySpy.callCount).to.equal(1))
                .then(() => assert(mySpy.calledWith({
                    type: 'removed',
                    payload: input,
                    namespace
                })))
            })
        })

        describe('on addedOrChanged function', () => {
            let selectSpy: SinonSpy
            const input = [1,2,3]
            beforeEach(() => {
                selectSpy = sandbox.spy(service, 'select')
            })

            it("should send a dispatch of 'addedOrChanged'", () => {
                const mySpy = sandbox.spy()
                sandbox.stub(store, 'dispatch')
                .callsFake((input => input.then(data => {
                    mySpy(data)
                    return data
                })) as any)

                return onFnMap['addedOrChanged'](input)
                .then(() => assert(mySpy.calledWith({
                    type: 'addedOrChanged',
                    payload: input,
                    namespace
                })))
            })

            it('should call select function with the first item from the input if is newList', () => {
                expect(selectSpy.callCount).to.equal(0)
                return onFnMap['addedOrChanged'](input)
                .then(() => expect(selectSpy.callCount).to.equal(1))
            })

            it('should NOT call select function if NOT newList', () => {
                return onFnMap['addedOrChanged'](input)
                .then(() => onFnMap['addedOrChanged'](input))
                .then(() => expect(selectSpy.callCount).to.equal(1))
            })
        })
    })

    describe('joinRoom function', () => {
        const room = 'awkjaweawef'
        let mySpy: SinonSpy
        beforeEach(() => {
            mySpy = sandbox.spy()

            return service.connect('')
            .then(() => sandbox.stub(store, 'dispatch')
            .callsFake((input => input.then(data => {
                mySpy(data)
                return data
            })) as any))
        })

        afterEach(() => {
            mySpy.resetHistory()
        })

        it("should send a dispatch of 'joinRoom'", () => {
            return service.joinRoom(room)
            .then(() => assert(mySpy.calledWith({
                type: 'joinRoom',
                payload: room,
                namespace
            })))
        })

        it("should get a connection and emit the input on channel 'join'", () => {
            return service.joinRoom(room)
            .then(() => store.getState()[namespace].socket)
            .then(socket => {
                expect(socket.emit.callCount).to.equal(1)
                assert(socket.emit.calledWith('join', room))
            })
        })
    })

    describe('disconnect function', () => {
        let mySpy: SinonSpy
        beforeEach(() => {
            mySpy = sandbox.spy()

            return service.connect('')
            .then(() => sandbox.stub(store, 'dispatch')
            .callsFake((input => input.then(data => {
                mySpy(data)
                return data
            })) as any))
        })

        it('should send a disconnect dispatch', () => {
            return service.disconnect()
            .then(() => store.getState()[namespace].socket)
            .then(socket => {
                expect(socket.disconnect.callCount).to.equal(1)
                assert(mySpy.calledWith({
                    type: 'disconnect',
                    payload: undefined,
                    namespace
                }))
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
