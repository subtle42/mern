import "mocha";
import {expect} from "chai";
import * as chai from "chai";
import "chai-http";
import { IBook } from "common/models";
import * as utils from "./utils";

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

        it("should throw an error if not logged in", done => {
            chai.request(`${baseUrl}`)
            .post("/api/books")
            .send({name: testName})
            .end((err, res) => {
                expect(res.status).not.to.equal(200);
                done();
            })
        })
        
        it("should create a new book", done => {
            chai.request(`${baseUrl}`)
            .post("/api/books")
            .set("Authorization", tokens[0])
            .send({name: testName})
            .end((err, res) => {
                expect(res.status).to.equal(200);
                const bookId = res.body;
                setTimeout(() => {
                    let foundBook:IBook = books.filter(b => b._id === bookId)[0];
                    expect(foundBook.name).to.equal(testName);
                    expect(foundBook.owner).to.equal(userIds[0]);
                    done();
                }, 20)
            })
        });
    })

    describe("PUT /api/books", () => {
        it("should return an error if user is NOT logged in", done => {
            expect(books[0]).not.to.be.undefined;
            chai.request(baseUrl)
            .put("/api/books")
            .send(books[0])
            .end((err, res) => {
                expect(res.status).not.to.equal(200)
                done()
            })
        })

        it("should return an error if user is NOT owner or editor", done => {
            expect(books[0]).not.to.be.undefined;
            expect(books[0].owner).not.to.equal(userIds[1]);
            chai.request(baseUrl)
            .put("/api/books")
            .set("authorization", tokens[1])
            .send(books[0])
            .end((err, res) => {
                expect(res.status).not.to.equal(200)
                done()
            })
        })

        it("should return successfully if user is the owner", done => {
            expect(books[0]).not.to.be.undefined;
            expect(books[0].owner).to.equal(userIds[0]);
            chai.request(baseUrl)
            .put("/api/books")
            .set("authorization", tokens[0])
            .send(books[0])
            .end((err, res) => {
                expect(res.status).to.equal(200)
                done()
            })
        })

        it("should return successfully if user is an editor", done => {
            expect(books[0]).not.to.be.undefined;
            let myBook = {...books[0]};
            myBook.editors = [];
            myBook.editors.push(userIds[1])
            expect(books[0].editors.indexOf(userIds[1])).to.equal(-1)

            chai.request(baseUrl)
            .put("/api/books")
            .set("authorization", tokens[0])
            .send(myBook)
            .end((err, res) => {
                expect(res.status).to.equal(200)
                const newName = "editor update"
                myBook.name = newName;
                chai.request(baseUrl)
                .put("/api/books")
                .set("authorization", tokens[1])
                .send(myBook)
                .end((err, res) => {
                    expect(res.status).to.equal(200)
                    expect(books[0].name).to.equal(newName)
                    done();
                })
            })
        })

        it("should throw an error if schema does NOT match", done => {
            expect(books.length).to.be.greaterThan(0);
            let myBook:any = {...books[0]};
            myBook.name = {bad: "data"};
            chai.request(`${baseUrl}`)
            .put("/api/books")
            .set("Authorization", tokens[0])
            .send(myBook)
            .end((err, res) => {
                expect(res.status).not.to.equal(200);
                done();
            })
        })
    })

    describe("DELETE /api/books", () => {
        let removed:string[] = [];
        before(() => {
            nsp.on("removed", (ids:string[]) => {
                removed = removed.concat(ids);
            })
        })

        after(() => nsp.removeListener("removed"))

        it("should return an error if user is NOT logged in", done => {
            chai.request(baseUrl)
            .del(`/api/books/myBookID`)
            .end((err, res) => {
                expect(res.status).not.to.equal(200);
                done();
            })
        })
        
        it("should broadcast the id of the deleted item", done => {
            expect(books.length).to.be.greaterThan(0);
            let myBookID = books[0]._id;
            expect(removed.indexOf(myBookID)).to.equal(-1);
            utils.createBook(tokens[0], "testinglkwe")
            .then(secondBookId => {
                chai.request(`${baseUrl}`)
                .del(`/api/books/${myBookID}`)
                .set("Authorization", tokens[0])
                .end((err, res) => {
                    expect(res.status).to.equal(200);
                    expect(removed.indexOf(myBookID)).not.to.equal(-1);
                    done();
                })
            })
        })

        it("should stop a delete if user is NOT the owner", done => {
            utils.createBook(tokens[0], "cannot remove")
            .then(bookId => {
                chai.request(`${baseUrl}`)
                .del(`/api/books/${bookId}`)
                .set("Authorization", tokens[1])
                .end((err, res) => {
                    expect(res.status).not.to.equal(200);
                    done();
                })
            })
        })
    })
})