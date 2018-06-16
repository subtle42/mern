import {expect} from "chai";
import * as chai from "chai";
import "chai-http";
import * as utils from "./utils"
import { IPage, IBook } from "common/models";

describe("Page API", () => {
    const userName = "test",
        email = "test@test.com",
        password = "asdf";
    let bookId:string,
        tokens:string[],
        userIds:string[];

    before(done => {
        utils.cleanDb()
        .then(() => Promise.all([
            utils.createUserAndLogin(utils.USERS[0]),
            utils.createUserAndLogin(utils.USERS[1]),
            utils.createUserAndLogin(utils.USERS[2])
        ]))
        .then(myTokens => tokens = myTokens)
        .then(tokens => Promise.all(tokens.map(t => utils.decodeToken(t))))
        .then(decoded => userIds = decoded.map(x => x._id))
        .then(() => utils.createBook(tokens[0], "myBook"))
        .then(id => bookId = id)
        .then(() => done())
    })

    after(done => {
        utils.cleanDb()
        .then(() => done())
    })

    describe("POST /api/pages", () => {
        let myBook:IBook;
        beforeEach(done => {
            utils.getBook(tokens[0], bookId)
            .then(book => myBook = book)
            .then(() => done())
        })

        it("should return an error if the user does not have edit access", done => {
            expect(myBook.editors.indexOf(userIds[1])).to.equal(-1)

            chai.request(utils.getBaseUrl())
            .post("/api/pages")
            .set("authorization", tokens[1])
            .send({
                name: "afwehjlkw",
                bookId: bookId
            })
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => done())
        })

        it("should return a success if user has owner access to the book", done => {
            chai.request(utils.getBaseUrl())
            .post("/api/pages")
            .set("authorization", tokens[0])
            .send({
                name: "afwehjlkw",
                bookId: bookId
            })
            .then(res => expect(res.status).to.equal(200))
            .then(() => done())
        })

        it("should return a success if user has edit access", done => {
            myBook.editors.push(userIds[1])
            utils.updateBook(tokens[0], myBook)
            .then(() => chai.request(utils.getBaseUrl())
            .post("/api/pages")
            .set("authorization", tokens[0])
            .send({
                name: "editor page",
                bookId: bookId
            }))
            .then(res => expect(res.status).to.equal(200))
            .then(() => done())
        })

        it("should return an error if user is NOT logged in", done => {
            chai.request(utils.getBaseUrl())
            .post("/api/pages")
            .send({
                name: "afwehjlkw",
                bookId: bookId
            })
            .then(res => expect(res.status).to.equal(401))
            .then(() => done())
        })
    })

    describe("PUT /api/pages", () => {
        let myBook:IBook,
            myPages:IPage[];

        beforeEach(done => {
            utils.getBook(tokens[0], bookId)
            .then(book => myBook = book)
            .then(() => utils.getPages(tokens[0], bookId))
            .then(pages => myPages = pages)
            .then(() => done())
        })

        it("should return an error if user is NOT logged in", done => {
            chai.request(utils.getBaseUrl())
            .put("/api/pages")
            .send({})
            .then(res => expect(res.status).to.equal(401))
            .then(() => done())
        })

        it("should return a success if user is the owner of the parent book", done => {
            let myPage:IPage = myPages[0];
            expect(myBook._id).to.equal(myPage.bookId)
            expect(myBook.owner).to.equal(userIds[0])

            chai.request(utils.getBaseUrl())
            .put("/api/pages")
            .set("authorization", tokens[0])
            .send(myPage)
            .then(res => expect(res.status).to.equal(200))
            .then(() => done())
        })

        it("should return a success if user is an editor of the parent book", done => {
            let myPage:IPage = myPages[0];
            expect(myPage).not.to.be.undefined;
            
            utils.decodeToken(tokens[1])
            .then(decoded => myBook.editors.push(decoded._id))
            .then(() => utils.updateBook(tokens[0], myBook))
            .then(() => {
                return chai.request(utils.getBaseUrl())
                .put("/api/pages")
                .set("authorization", tokens[1])
                .send(myPage)
            })
            .then(res => expect(res.status).to.equal(200))
            .then(() => done())
        })
        
        it("should return a failure if user NOT an owner or an editor", done => {
            let myPage:IPage = myPages[0];
            expect(myPage).not.to.be.undefined;

            chai.request(utils.getBaseUrl())
            .put("/api/pages")
            .set("authorization", tokens[2])
            .send(myPage)
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => done())
            
        })

        it("should return a failure if schema does not match", done => {
            let myPage:any = myPages[0];
            expect(myPage).not.to.be.undefined;
            myPage.name = {badData: "awekfjwef"};

            chai.request(utils.getBaseUrl())
            .put("/api/pages")
            .set("authorization", tokens[0])
            .send(myPage)
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => done())
        })

        xit("should send a broadcast in the book's room", () => {})
        xit("should NOT send a broadcast to any other book's room", () => {})
    })

    describe("DELETE /api/pages", () => {
        let myBook:IBook,
        myPages:IPage[];

        beforeEach(done => {
            utils.getPages(tokens[0], bookId)
            .then(data => myPages = data)
            .then(() => utils.getBook(tokens[0], bookId))
            .then(data => myBook = data)
            .then(() => done())
        })

        it("should return a failure if user is not logged in", done => {
            chai.request(utils.getBaseUrl())
            .del("/api/pages/myID")
            .then(res => expect(res.status).to.equal(401))
            .then(() => done())
        })

        it("should return an error if page does NOT exist", done => {
            expect(myBook.owner).to.equal(userIds[0])

            chai.request(utils.getBaseUrl())
            .del("/api/pages/badId")
            .set("authorization", tokens[0])
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => done())
        })

        it("should return a success if the user is the owner of the parent book", done => {
            utils.createPage(tokens[0], bookId, "to remove")
            .then(pageId => {
                return chai.request(utils.getBaseUrl())
                .del(`/api/pages/${pageId}`)
                .set("authorization", tokens[0])
                .then(res => expect(res.status).to.equal(200))
                .then(() => utils.getPages(tokens[0], bookId))
                .then(pages => expect(pages.filter(p => p._id === pageId).length).to.equal(0))
            })
            .then(() => done())
        })

        it("should return a success if the user is an editor of the parent book", done => {
            expect(myBook.editors.indexOf(userIds[1])).not.to.equal(-1)
            
            utils.createPage(tokens[0], bookId, "editor remove")
            .then(pageId => {
                return chai.request(utils.getBaseUrl())
                .del(`/api/pages/${pageId}`)
                .set("authorization", tokens[1])
                .then(res => expect(res.status).to.equal(200))
                .then(() => utils.getPages(tokens[0], bookId))
                .then(pages => expect(pages.filter(p => p._id === pageId).length).to.equal(0))
            })
            .then(() => done())
        })
        xit("should recieve broadcast on the delete channel if in that book room", () => {})
        xit("should NOT broadcast on the removed channel if NOT in the same book room", () => {})
    })
})