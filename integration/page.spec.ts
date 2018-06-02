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
        nsp:SocketIOClient.Socket,
        pages:IPage[] = [];

    before(done => {
        utils.cleanDb()
        .then(() => Promise.all([
            utils.createUserAndLogin(utils.USERS[0]),
            utils.createUserAndLogin(utils.USERS[1]),
            utils.createUserAndLogin(utils.USERS[2])
        ]))
        .then(myTokens => tokens = myTokens)
        .then(() => utils.createBook(tokens[0], "myBook"))
        .then(id => bookId = id)
        .then(() => {
            nsp = utils.websocketConnect("pages", tokens[0])
            nsp.on("addedOrChanged", (data:IPage[]) => {
                data.forEach(item => {
                    pages = pages.filter(book => book._id !== item._id)
                    pages.push(item);
                })
            })
            nsp.emit("join", bookId)
        })
        .then(() => done())
        .catch(err => console.error(err.message))
    })

    after(done => {
        nsp.disconnect();
        utils.cleanDb()
        .then(() => done())
    })

    describe("POST /api/pages", () => {
        it("should return the created pageId", done => {
            chai.request(utils.getBaseUrl())
            .post("/api/pages")
            .set("authorization", tokens[0])
            .send({
                name: "afwehjlkw",
                bookId: bookId
            })
            .then(res => {
                expect(res.status).to.equal(200);
                expect(typeof res.body).to.equal("string")
                // setTimeout(() => {
                //     expect(pages.filter(p => p._id === myId).length).to.equal(1);
                //     done();
                // }, 20)
            })            
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

        // xit("should send a broadcast on the addedOrChanged channel of the sent book", () => {})
        // xit("should NOT send a broadcast on the addedOrChanged channel of a different book", () => {})
    })

    describe("PUT /api/pages", () => {
        let bookNsp:SocketIOClient.Socket,
            books:IBook[] = [];

        before(done => {
            bookNsp = utils.websocketConnect("books", tokens[0])
            bookNsp.on("addedOrChanged", (data:IBook[]) => {
                data.forEach(item => {
                    books = books.filter(book => book._id !== item._id);
                })
                books = books.concat(data);
            })
            done()
        })

        after(() => {
            bookNsp.close()
        })

        it("should return an error if user is NOT logged in", done => {
            chai.request(utils.getBaseUrl())
            .put("/api/pages")
            .send({})
            .then(res => expect(res.status).to.equal(401))
            .then(() => done())
        })

        it("should return a success if user is the owner of the parent book", done => {
            expect(pages[0]).not.to.be.undefined;
            let myPage:IPage = {...pages[0]};

            chai.request(utils.getBaseUrl())
            .put("/api/pages")
            .set("authorization", tokens[0])
            .send(pages[0])
            .then(res => expect(res.status).to.equal(200))
            .then(() => done())
        })

        it("should return a success if user is an editor of the parent book", done => {
            let myBook:IBook = books.filter(b => b._id === bookId)[0],
                myPage:IPage = pages.filter(p => p.bookId === myBook._id)[0];
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
            let myBook:IBook = books.filter(b => b._id === bookId)[0],
                myPage:IPage = pages.filter(p => p.bookId === myBook._id)[0];
            expect(myPage).not.to.be.undefined;

            chai.request(utils.getBaseUrl())
            .put("/api/pages")
            .set("authorization", tokens[2])
            .send(myPage)
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => done())
            
        })

        it("should return a failure if schema does not match", done => {
            done();
        })

        xit("should send a broadcast in the book's room", () => {})
        xit("should NOT send a broadcast to any other book's room", () => {})
    })

    describe("DELETE /api/pages", () => {
        xit("should send back a success", () => {})
        xit("should return a failure if user is not logged in", () => {})
        xit("should recieve broadcast on the delete channel if in that book room", () => {})
        xit("should NOT broadcast on the removed channel if NOT in the same book room", () => {})
        xit("should NOT return a success if user is NOT the owner", () => {})
    })
})