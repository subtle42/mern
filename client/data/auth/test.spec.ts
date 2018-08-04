import 'mocha'
import { expect } from 'chai'
import actions from './actions'
import axios from 'axios'
import { sandbox, SinonSandbox, SinonFakeServer, spy, stub, useFakeXMLHttpRequest, SinonFakeXMLHttpRequest } from 'sinon'
import * as Promise from 'bluebird'

describe('AuthActions', () => {
    let mySandbox: SinonSandbox
    let myServer: SinonFakeServer
    let xhr: SinonFakeXMLHttpRequest

    beforeEach(() => {
        xhr = useFakeXMLHttpRequest()
        mySandbox = sandbox.create()
        myServer = mySandbox.useFakeServer()
    })

    afterEach(() => {
        xhr.restore()
        myServer.restore()
        mySandbox.restore()
    })

    describe('create function', () => {
        xit('should send a post request', () => undefined)
        xit('should send the input as the request body', () => undefined)
        xit('should return request response in a promise', () => undefined)
    })

    describe('update function', () => {
        xit('should send a put request', () => undefined)
        xit('should send the input as the request body', () => undefined)
        xit('should return a promise void', () => undefined)
        xit('should send the request response to the store', () => undefined)
    })

    describe('preload function', () => {
        xit('should do nothing if auth token is NOT in cookies', () => undefined)
        xit('should set axios auth header', () => undefined)
    })
    describe('login function', () => undefined)
    describe('logout function', () => undefined)

})
