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
            .then(res => expect(res.status).to.equal(401))
            .then(() => done())
        })

        it("should return an error if user is NOT owner or editor", done => {
            expect(books[0]).not.to.be.undefined;
            expect(books[0].owner).not.to.equal(userIds[1]);
            chai.request(baseUrl)
            .put("/api/books")
            .set("authorization", tokens[1])
            .send(books[0])
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => done())
        })

        it("should return a success if user is the owner", done => {
            expect(books[0]).not.to.be.undefined;
            expect(books[0].owner).to.equal(userIds[0]);
            chai.request(baseUrl)
            .put("/api/books")
            .set("authorization", tokens[0])
            .send(books[0])
            .then(res => expect(res.status).to.equal(200))
            .then(() => done())
        })

        it("should return a success if user is an editor", done => {
            const newName = "editor update"
            expect(books[0]).not.to.be.undefined;
            let myBook = {...books[0]};
            myBook.editors = [];
            myBook.editors.push(userIds[1])
            expect(books[0].editors.indexOf(userIds[1])).to.equal(-1)

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
                .send(myBook);
            })
            .then(res => {
                expect(res.status).to.equal(200)
                expect(books[0].name).to.equal(newName)
            })
            .then(() => done())
        })

        it("should return an error if schema does NOT match", done => {
            expect(books.length).to.be.greaterThan(0);
            let myBook:any = {...books[0]};
            myBook.name = {bad: "data"};
            chai.request(`${baseUrl}`)
            .put("/api/books")
            .set("Authorization", tokens[0])
            .send(myBook)
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => done())
        })

        it("should return an error if a user other than the owner tries to change the owner", done => {
            expect(books[0]).not.to.be.undefined;
            let toUpdate:IBook = {...books[0]};
            expect(toUpdate.owner).to.equal(userIds[0])
            expect(toUpdate.editors.indexOf(userIds[1])).not.to.equal(-1)
            toUpdate.owner = userIds[1];

            chai.request(baseUrl)
            .put("/api/books")
            .set("authorization", tokens[1])
            .send(toUpdate)
            .then(res => expect(res.status).not.to.equal(200))
            .then(res => done())
        })

        it("should return a success if the owner changes the owner field", done => {
            utils.createBook(tokens[0], "changeMe")
            .then(bookId => books.filter(b => b._id === bookId)[0])
            .then(toUpdate => {
                toUpdate.owner = userIds[1];
                return chai.request(baseUrl)
                .put("/api/books")
                .set("authorization", tokens[0])
                .send(toUpdate)
            })
            .then(res => expect(res.status).to.equal(200))
            .then(res => done())
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
            .then(res => expect(res.status).to.equal(401))
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

        it("should stop a delete if user is NOT the owner", done => {
            utils.createBook(tokens[0], "cannot remove")
            .then(bookId => {
                return chai.request(`${baseUrl}`)
                .del(`/api/books/${bookId}`)
                .set("Authorization", tokens[1])
            })
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => done())
        })
    })
})