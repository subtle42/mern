import {expect} from "chai";
import * as chai from "chai";
import "chai-http";
import { IBook } from "common/models";
import * as utils from "./utils";
import { bind } from "bluebird";

describe("Book API", () => {
    let tokens:string[];
    let nsp:SocketIOClient.Socket;
    let userIds:string[];
    let books:IBook[] =[];
    const baseUrl = utils.getBaseUrl();

    before(done => {
        utils.cleanDb()
        .then(() => Promise.all([
            utils.createUserAndLogin(utils.USERS[0]),
            utils.createUserAndLogin(utils.USERS[1])
        ]))
        .then(authTokens => tokens = authTokens)
        .then(() => Promise.all(tokens.map(token => utils.decodeToken(token))))
        .then(decodedTokens => userIds = decodedTokens.map(decoded => decoded._id))
        .then(() => {
            nsp = utils.websocketConnect("books", tokens[0])
            nsp.on("addedOrChanged", (data:IBook[]) => {
                data.forEach(item => {
                    books = books.filter(book => book._id !== item._id)
                    books.push(item);
                })
            })
        })
        .then(() => done())
        .catch(err => console.error(err))
    });

    after(done => {
        utils.cleanDb()
        .then(() => nsp.disconnect())
        .then(() => done())
        .catch(err => console.error(err))
    });

    describe("POST /api/books", () => {
        const testName = "unitTest";

        it("should return an error if user is NOT logged in", done => {
            chai.request(`${baseUrl}`)
            .post("/api/books")
            .send({name: testName})
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => done())
        })
        
        it("should create a new book", done => {
            chai.request(`${baseUrl}`)
            .post("/api/books")
            .set("Authorization", tokens[0])
            .send({name: testName})
            .then(res => {
                expect(res.status).to.equal(200);
                return utils.getBook(tokens[0], res.body)
            })
            .then(book => {
                expect(book.name).to.equal(testName);
                expect(book.owner).to.equal(userIds[0]);
                done();
            })
        });
    })

    describe("PUT /api/books", () => {
        let bookId:string,
            myBook:IBook;

        before(done => {
            utils.createBook(tokens[0], "update book test")
            .then(id => bookId = id)
            .then(() => done())
        })

        beforeEach(done => {
            utils.getBook(tokens[0], bookId)
            .then(book => myBook = book)
            .then(() => done())
        })

        it("should return an error if user is NOT logged in", done => {
            chai.request(baseUrl)
            .put("/api/books")
            .send(myBook)
            .then(res => expect(res.status).to.equal(401))
            .then(() => done())
        })

        it("should return an error if user is NOT owner or editor", done => {
            expect(myBook.owner).not.to.equal(userIds[1]);
            const newName = "fawliejfwalef";
            myBook.name = newName;

            chai.request(baseUrl)
            .put("/api/books")
            .set("authorization", tokens[1])
            .send(myBook)
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => utils.getBook(tokens[0], myBook._id))
            .then(book => expect(book.name).not.to.equal(newName))
            .then(() => done())
        })

        it("should return a success if user is the owner", done => {
            expect(myBook.owner).to.equal(userIds[0]);
            chai.request(baseUrl)
            .put("/api/books")
            .set("authorization", tokens[0])
            .send(books[0])
            .then(res => expect(res.status).to.equal(200))
            .then(() => done())
        })

        it("should return a success if user is an editor", done => {
            const newName = "editor update"
            myBook.editors.push(userIds[1])

            chai.request(baseUrl)
            .put("/api/books")
            .set("authorization", tokens[0])
            .send(myBook)
            .then(res => {
                expect(res.status).to.equal(200)
                myBook.name = newName;
                return chai.request(baseUrl)
                .put("/api/books")
                .set("authorization", tokens[1])
                .send(myBook)
            })
            .then(res => expect(res.status).to.equal(200))
            .then(() => utils.getBook(tokens[1], myBook._id))
            .then(book => expect(book.name).to.equal(newName))
            .then(() => done())
        })

        it("should return an error if schema does NOT match", done => {
            let tmp:any = myBook;
            tmp.name = {bad: "data"};
            chai.request(`${baseUrl}`)
            .put("/api/books")
            .set("Authorization", tokens[0])
            .send(tmp)
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => done())
        })

        it("should return an error if a user other than the owner tries to change the owner", done => {
            expect(myBook.owner).to.equal(userIds[0])
            expect(myBook.editors.indexOf(userIds[1])).not.to.equal(-1)
            myBook.owner = userIds[1];

            chai.request(baseUrl)
            .put("/api/books")
            .set("authorization", tokens[1])
            .send(myBook)
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => utils.getBook(tokens[0], myBook._id))
            .then(book => expect(book.owner).to.equal(userIds[0]))
            .then(res => done())
        })

        it("should return a success if the owner changes the owner field", done => {
            expect(myBook.owner).to.equal(userIds[0])
            myBook.owner = userIds[1];
            chai.request(baseUrl)
            .put("/api/books")
            .set("authorization", tokens[0])
            .send(myBook)
            .then(res => expect(res.status).to.equal(200))
            .then(res => done())
        })
    })

    describe("DELETE /api/books", () => {
        let removed:string[] = [],
            myBook:IBook;
        before(done => {
            nsp.on("removed", (ids:string[]) => {
                removed = removed.concat(ids);
            })
            utils.createBook(tokens[0], "to delete")
            .then(id => utils.getBook(tokens[0], id))
            .then(book => myBook = book)
            .then(() => done())
        })

        after(() => nsp.removeListener("removed"))

        it("should return an error if user is NOT logged in", done => {
            chai.request(baseUrl)
            .del(`/api/books/myBookID`)
            .then(res => expect(res.status).to.equal(401))
            .then(() => done())
        })

        it("should return and error if book does NOT exist", done => {
            chai.request(baseUrl)
            .del(`/api/books/myBookID`)
            .set("Authorization", tokens[0])
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => done())
        })
        
        it("should stop a delete if user is NOT the owner", done => {
            chai.request(`${baseUrl}`)
            .del(`/api/books/${myBook._id}`)
            .set("Authorization", tokens[1])
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => utils.getBook(tokens[0], myBook._id))
            .then(book => expect(book).not.to.be.undefined)
            .then(() => done())
        })

        it("should broadcast the id of the deleted item", done => {
            expect(books.length).to.be.greaterThan(0);
            let myBookID = books[0]._id;
            expect(removed.indexOf(myBookID)).to.equal(-1);
            utils.createBook(tokens[0], "testinglkwe")
            .then(secondBookId => {
                return chai.request(`${baseUrl}`)
                .del(`/api/books/${myBookID}`)
                .set("Authorization", tokens[0])
            })
            .then(res => {
                expect(res.status).to.equal(200);
                expect(removed.indexOf(myBookID)).not.to.equal(-1);
            })
            .then(() => done())
        })
    })
})