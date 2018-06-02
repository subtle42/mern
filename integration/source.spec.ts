import {expect} from "chai";
import * as chai from "chai";
import "chai-http";
import { ISource } from "common/models";
import * as utils from "./utils";
import * as fs from "fs"

describe("Source API", () => {
    let tokens:string[] =[];
    const baseUrl = utils.getBaseUrl();

    before(done => {
        Promise.all([
            utils.createUserAndLogin(utils.USERS[0]),
            utils.createUserAndLogin(utils.USERS[1])
        ])
        .then(users => tokens = users)
        .then(() => done())
    })

    after(done => {
        utils.cleanDb()
        .then(() => done())
    })

    describe("POST /api/sources", () => {
        it("should return an error if user is NOT logged in", done => {
            chai.request(`${baseUrl}`)
            .post("/api/sources")
            .send({})
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => done())
        })

        it("should return a string", done => {
            chai.request(`${baseUrl}`)
            .post("/api/sources")
            .set("Authorization", tokens[0])
            .attach("file", fs.readFileSync("./integration/data/2012_SAT_RESULTS.csv"), "2012_SAT_RESULTS.csv")
            .then(res => expect(res.status).to.equal(200))
            .then(() => done())
        })
    })

    describe("DELETE /api/sources", () => {
        let sourceId:string;

        before(done => {
            utils.createSource(tokens[0], "./integration/data/2012_SAT_RESULTS.csv")
            .then(newSourceId => sourceId = newSourceId)
            .then(() => done())
        })

        it("should return an error if user is NOT logged in", done => {
            chai.request(baseUrl)
            .del(`/api/sources/${sourceId}`)
            .then(res => expect(res.status).to.equal(401))
            .then(() => done())
        })

        it("should return an error if record does NOT exist", done => {
            chai.request(baseUrl)
            .del(`/api/sources/ERROR`)
            .set("authorization", tokens[0])
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => done())
        })

        it("should return an error if a user other than owner tries to delete", done => {
            chai.request(baseUrl)
            .del(`/api/sources/${sourceId}`)
            .set("authorization", tokens[1])
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => done())
        })
    })

    describe("POST /api/sources/query", () => {
        it("should return an error if user is NOT logged in", done => {
            chai.request(`${baseUrl}`)
            .post("/api/sources/query")
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => done())
        })

        it("should return records", done => {
            chai.request(baseUrl)
            .post("/api/sources")
            .set("Authorization", tokens[0])
            .attach("file", fs.readFileSync("./integration/data/2012_SAT_RESULTS.csv"), "2012_SAT_RESULTS.csv")
            .then(res => {
                expect(res.status).to.equal(200);
                return chai.request(`${baseUrl}`)
                .post("/api/sources/query")
                .set("Authorization", tokens[0])
                .send({
                    sourceId: res.body,
                    measures: [],
                    dimensions: [],
                    filters: []
                })
            })
            .then(res => expect(res.status).to.equal(200))
            .then(() => done())
        })
    })
})