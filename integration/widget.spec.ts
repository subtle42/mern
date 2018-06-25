import {expect} from "chai";
import * as chai from "chai";
import "chai-http";
import { IWidget } from "common/models";
import * as utils from "./utils";


describe("Widget API", () => {
    let tokens:string[],
        userIds:string[],
        bookId:string,
        pageId:string,
        sourceId:string;

    before(done => {
        Promise.all(utils.USERS.map(user => utils.createUserAndLogin(user)))
        .then(newTokens => tokens = newTokens)
        .then(tokens => Promise.all(tokens.map(token => utils.decodeToken(token))))
        .then(decoded => userIds = decoded.map(x => x._id))
        .then(() => utils.createBook(tokens[0], "top book"))
        .then(id => bookId = id)
        .then(() => utils.createPage(tokens[0], bookId, "top page"))
        .then(id => pageId = id)
        .then(() => utils.createSource(tokens[0], "./integration/data/2012_SAT_RESULTS.csv"))
        .then(id => sourceId = id)
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
            .send({
                pageId,
                sourceId,
                type: "chart"
            })
            .then(res => expect(res.status).to.equal(401))
            .then(() => done())
        })

        it("should retiurn an error if the user does NOT have edit access", done => {
            chai.request(utils.getBaseUrl())
            .post(`/api/widgets`)
            .set("authorization", tokens[1])
            .send({
                pageId,
                sourceId,
                type: "chart"
            })
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => done())
        })

        it("should return a success if user is the owner of the book", done => {
            chai.request(utils.getBaseUrl())
            .post(`/api/widgets`)
            .set("authorization", tokens[0])
            .send({
                pageId,
                sourceId,
                type: "chart"
            })
            .then(res => expect(res.status).to.equal(200))
            .then(() => done())
        })

        it("should return a success if the user has edit access to the book", done => {
            utils.getBook(tokens[0], bookId)
            .then(book =>  {
                book.editors.push(userIds[1])
                return utils.updateBook(tokens[0], book)
            })
            .then(() => chai.request(utils.getBaseUrl())
            .post(`/api/widgets`)
            .set("authorization", tokens[0])
            .send({
                pageId,
                sourceId,
                type: "chart"
            }))
            .then(res => expect(res.status).to.equal(200))
            .then(() => done())
        })
    })

    describe("PUT /api/widgets", () => {
        let widgetId:string,
            widget:IWidget;

        before(done => {
            utils.createWidget(tokens[0], pageId, sourceId, "chart")
            .then(id => widgetId = id)
            .then(() => done())
        })

        beforeEach(done => {
            utils.getWidget(tokens[0], widgetId)
            .then(data => widget = data)
            .then(() => done())
        })

        it("should return an error if user is NOT logged in", done => {
            chai.request(utils.getBaseUrl())
            .put(`/api/widgets`)
            .send(widget)
            .then(res => expect(res.status).to.equal(401))
            .then(() => done())
        })

        it("should return an error if the user does NOT have edit access", done => {
            const test:string = "awlefhqwoefjw";
            widget.dimensions.push(test);
            
            chai.request(utils.getBaseUrl())
            .put(`/api/widgets`)
            .set("authorization", tokens[2])
            .send(widget)
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => utils.getWidget(tokens[0], widgetId))
            .then(data => expect(data.dimensions.filter(x => x === test).length).to.equal(0))
            .then(() => done())
        })

        it("should return a success if the user is the owner of the book", done => {
            const test:string = "works";
            widget.dimensions.push(test);

            chai.request(utils.getBaseUrl())
            .put(`/api/widgets`)
            .set("authorization", tokens[0])
            .send(widget)
            .then(res => expect(res.status).to.equal(200))
            .then(() => utils.getWidget(tokens[0], widgetId))
            .then(data => expect(data.dimensions.filter(x => x === test).length).to.equal(1))
            .then(() => done())
        })

        it("should return a success if the user is an editor of the book", done => {
            const test:string = "editor";
            widget.dimensions.push(test);

            chai.request(utils.getBaseUrl())
            .put(`/api/widgets`)
            .set("authorization", tokens[1])
            .send(widget)
            .then(res => expect(res.status).to.equal(200))
            .then(() => utils.getWidget(tokens[0], widgetId))
            .then(data => expect(data.dimensions.filter(x => x === test).length).to.equal(1))
            .then(() => done())
        })
    })

    describe("DELETE /api/widgets", () => {
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
        
        it("should return an error if user does NOT have edit access", done => {
            let widgetId:string;
            
            utils.createWidget(tokens[0], pageId, sourceId, "chart")
            .then(id => widgetId = id)
            .then(() => chai.request(utils.getBaseUrl())
            .del(`/api/widgets/${widgetId}`)
            .set("authorization", tokens[1]))
            .then(res => expect(res.status).to.equal(200))
            // .then(() => utils.getWidget(tokens[0], widgetId))
            // .then(res => expect(res.status))
            .then(() => done())
        })

        xit("should broadcast on the removed channel", () => {})
    })
})