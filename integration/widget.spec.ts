import {expect} from "chai";
import * as chai from "chai";
import "chai-http";
import { IWidget } from "common/models";
import * as utils from "./utils";


describe("Widget API", () => {
    let tokens:string[],
        userIds:string[],
        bookId:string,
        pageId:string;

    before(done => {
        Promise.all(utils.USERS.map(user => utils.createUserAndLogin(user)))
        .then(newTokens => tokens = newTokens)
        .then(tokens => Promise.all(tokens.map(token => utils.decodeToken(token))))
        .then(decoded => userIds = decoded.map(x => x._id))
        .then(() => utils.createBook(tokens[0], "top book"))
        .then(id => bookId = id)
        .then(() => utils.createPage(tokens[0], bookId, "top page"))
        .then(id => pageId = id)
        .then(() => done())
    })

    after(done => {
        utils.cleanDb()
        .then(() => done())
    })

    describe("POST /api/widgets", () => {
        it("should return an error if user is NOT logged in", done => {
            chai.request(utils.getBaseUrl())
            .post(`/api/widgets`)
            .send({})
            .then(res => expect(res.status).to.equal(401))
            .then(() => done())
        })

        xit("should ", done => {
            done()
        })
    })

    describe("PUT /api/widgets", () => {
        xit("should return an error if user is NOT logged in", () => {})
        xit("should ", () => {})
    })

    describe("DELETE /api/widgets", () => {
        let widgetId:string;
        before(done => {
            done()
        })

        it("should return an error if user is NOT logged in", done => {
            chai.request(utils.getBaseUrl())
            .del(`/api/widgets/asdf`)
            .then(res => expect(res.status).to.equal(401))
            .then(() => done())
        })

        it("should return an error if widget does NOT exist", done => {
            chai.request(utils.getBaseUrl())
            .del(`/api/widgets/asdf`)
            .set("authorization", tokens[0])
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => done())
        })
        
        xit("should return an error if user does NOT have edit access", () => {

        })

        xit("should broadcast on the removed channel", () => {})
    })
})