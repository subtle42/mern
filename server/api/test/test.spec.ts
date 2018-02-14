import "mocha";
import {expect} from "chai";
import * as io from "socket.io-client";
const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const URL = "http://localhost:3333";

describe("hello", () => {

    beforeEach(done => {
        console.log("beforeEach")
        done();
    });

    afterEach(done => {
        console.log("afterEach");
        done();
    })

    xit("should do something", () => {
    
        expect(1).to.equal(1);
    });

    xit("should make a REST call", done => {
        chai.request(URL)
        .get("/")
        .end((err:any, res:any) => {
            expect(err).to.equal(null);
            console.log(res.text)
            done();
        })
    })

    xit("should make a socket connection", done => {
        io.connect('/books')
        .on("error", (err) => {
            console.log(err);
            expect(err).not.to.equal(null);
            done();
        })
    })
})