import "mocha";
import {expect} from "chai";
const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);



describe("hello", () => {

    beforeEach(done => {
        console.log("beforeEach")
        done();
    });

    afterEach(done => {
        console.log("afterEach");
        done();
    })

    it("should do something", () => {
    
        expect(1).to.equal(1);
    });

    it("should make a REST call", done => {
        chai.request("http://localhost:3333")
        .get("/")
        .end((err:any, res:any) => {
            expect(err).to.equal(null);
            console.log(res.text)
            done();
        })
    })
})