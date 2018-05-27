
import BaseActions from "./baseActions";
import "mocha"
import {expect} from "chai";
import {spy, SinonSpy, stub, SinonStub} from "sinon";
import * as io from "socket.io-client";


class TestBaseActions extends BaseActions {
    constructor(store, nameSpace) {
        super(store, nameSpace);
    }

    select(item) {
        return stub().returns(new Promise(resolve => resolve())) as any;
    }

    create(input) {
        return stub().returns(new Promise(resolve => resolve("create"))) as any;        
    }

    delete(item):Promise<void> {
        return stub().returns(new Promise(resolve => resolve())) as any;        
    }
    
    update(item):Promise<void> {
        return stub().returns(new Promise(resolve => resolve())) as any;        
    }
}

describe("Base Actions for Redux", () => {
    let service:BaseActions,
        store,
        ioConnect:SinonStub,
        ioOn:SinonStub;

    beforeEach(() => {
        store = {
            dispatch: spy()
        };

        ioConnect = stub(io, "connect").returns({
            on: function() {
                return this
            }
        })


        service = new TestBaseActions(store, "testing");
    })

    afterEach(() => {
        ioConnect.restore()
    })

    describe("connection function", () => {
        it("should connect to its namespace", () => {
            expect(ioConnect.callCount).to.equal(0);
            service.connect("")
            expect(ioConnect.calledWith(`/testing`))
        })
    })
})