import "mocha";
import {expect} from "chai";
import actions from "./actions";
import axios from "axios";
import {sandbox, SinonSandbox, SinonFakeServer} from "sinon";
import {spy, stub, useFakeXMLHttpRequest, SinonFakeXMLHttpRequest} from "sinon";
import * as Promise from "bluebird";

describe("AuthActions", () => {
    let mySandbox:SinonSandbox,
        myServer:SinonFakeServer;
    let xhr:SinonFakeXMLHttpRequest;

    beforeEach(() => {
        xhr = useFakeXMLHttpRequest();
        mySandbox = sandbox.create();
        myServer = mySandbox.useFakeServer();
    });

    afterEach(() => {
        xhr.restore();
        myServer.restore();
        mySandbox.restore();
    });

    it("should do soemthing", () => {
        const res = new Promise((r) => r({data: ""}));
        mySandbox.stub(axios, `post`).returns(res);
        // spy(actions, );


        actions.login("", "")
        .then(res => console.log(res))
    })
})