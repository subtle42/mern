import "mocha";
import {stub, spy} from "sinon"
import {expect, assert, should} from "chai"

declare var global;
const mySocket = {
    on: spy(),
    leaveAll: spy(),
    join: spy()
}

const emitSpy = spy();

const ofResponse = {
    on: stub().callsFake((myStr, cb) => {
        cb(mySocket);
    }),
    in: stub().returns({
        emit: emitSpy
    })
}

global.myIO = {
    of: stub().returns(ofResponse)
}

import {AclSocket} from "./aclSocket"
import { Promise } from "bluebird";

describe("AclSocket Base class", () => {
    let tmpClass:AclSocket;

    beforeEach(() => {
        // global.myIO.of.returns = "hello"
        // tmpClass = new TmpClass("", null);
        // global.myIO.of.returnValue = "test";
    });

    afterEach(() => {
        Object.keys(mySocket).forEach(key => mySocket[key].resetHistory())
        Object.keys(ofResponse).forEach(key => ofResponse[key].resetHistory())
        emitSpy.resetHistory();
    })

    describe("constructor", () => {
        it("should create a namespace base on first input", () => {
            let name = "asdfasdf";
            let tmp = new AclSocket(name, null);
            assert(global.myIO.of.calledWith(name))
        });

        it("should call socket.on channel with 'join'", () => {
            expect(mySocket.on.callCount).equals(0);
            let tmp = new AclSocket("asdf", null);
            expect(mySocket.on.callCount).equals(1);
            expect(mySocket.on.calledWith("join")).equals(true);
        });

        // it("should call ")
    });

    describe("onJoin", () => {
        const room = "TestRoom";
        const fakeModel:any = {
            find: stub().returns({
                exec:stub().returns(new Promise(res => res()))
            })
        };
        beforeEach(() => {
            mySocket.on = stub().callsFake((channel, cb) => {
                cb(room);
            })
        })

        it("should call socket.leaveAll", () => {
            expect(mySocket.leaveAll.callCount).equals(0);
            new AclSocket("",  fakeModel);
            expect(mySocket.leaveAll.callCount).equals(1);
        })

        it("should call socket.join with the input", () => {
            expect(mySocket.join.callCount).equals(0);
            mySocket.on = stub().callsFake((channel, cb) => {
                cb(room);
            })
            new AclSocket("",  fakeModel);
            expect(mySocket.join.calledWith(room)).equals(true);
        })

        it("should call emit with the response from the model query on the 'addedOrChanged' channel", () => {
            expect(emitSpy.callCount).equals(0);
            mySocket.on = stub().callsFake((channel, cb) => {
                cb(room);
            })
            new AclSocket("",  fakeModel);
            // expect(emitSpy.callCount).equals(1);
            
        })
    })

    describe("onAddOrChange", () => {})

    describe("onDelete", () => {})
});