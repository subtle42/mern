import "mocha";
import {expect} from "chai";
const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
import {AxiosResponse, AxiosError} from "axios"



const baseUrl = "http://localhost:3333";


describe("hello", () => {

    beforeEach(done => {
        console.log("beforeEach")
        done();
    });

    afterEach(done => {
        console.log("afterEach");
        done();
    });


    it("should create a new book", done => {
        const testName = "unitTest";
        chai.request(`${baseUrl}`)
        .post("/api/books")
        .send({name: testName,
        token: "yusuf"})
        .end((err:AxiosError, res) => {
            expect(err).not.to.equal(null);
            expect(res.status).to.equal(200);
            done();
        })
    });


    // it("should do something", () => {
    //     expect(1).to.equal(1);
    // });

    // it("should make a REST call", done => {
    //     chai.request("http://localhost:3333")
    //     .get("/")
    //     .end((err:AxiosError, res:AxiosResponse) => {
    //         expect(err).to.equal(null);
    //         // console.log(res.text)
    //         done();
    //     })
    // })
})