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

    describe("create function", () => {
        xit("should send a post request", () => {})
        xit("should send the input as the request body", () => {})
        xit("should return request response in a promise", () => {})        
    })

    describe("update function", () => {
        xit("should send a put request", () => {})
        xit("should send the input as the request body", () => {})
        xit("should return a promise void", () => {})  
        xit("should send the request response to the store", () => {})  
    })

    describe("preload function", () => {
        xit("should do nothing if auth token is NOT in cookies", () => {})
        xit("should set axios auth header", () => {})
    })
    describe("login function", () => {})
    describe("logout function", () => {})
    
})