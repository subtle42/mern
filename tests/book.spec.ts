import "mocha";
import {expect} from "chai";
const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
import { IBook } from "common/models";
import * as utils from "./utils";

describe("Book API", () => {
    let token:string = "";
    let nsp:SocketIOClient.Socket;
    let myId:string;
    let books:IBook[] =[];
    const baseUrl = utils.getBaseUrl();

    before(done => {
        utils.cleanDb()
        .then(() => utils.createUserAndLogin(utils.USERS[0]))
        .then(myToken => {
            token = myToken;
            return utils.decodeToken(token);
        })
        .then(decoded => {
            myId = decoded._id;
            nsp = utils.websocketConnect("books", token)
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

    describe("create function", () => {
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
            .set("Authorization", token)
            .send({name: testName})
            .end((err, res) => {
                expect(res.status).to.equal(200);
                const bookId = JSON.parse(res.text);
                let foundBook:IBook = books.filter(b => b._id === bookId)[0];
                expect(foundBook.name).to.equal(testName);
                expect(foundBook.owner).to.equal(myId);
                done();
            })
        });
    })

    describe("update function", () => {
        it("should broadcast the updated item", done => {
            expect(books.length).to.be.greaterThan(0);
            let myBook = {...books[0]};
            const newName = "updateTest";
            myBook.name = newName;
            chai.request(`${baseUrl}`)
            .put("/api/books")
            .set("Authorization", token)
            .send(myBook)
            .end((err, res) => {
                expect(res.status).to.equal(200);
                const updatedBook:IBook = books.filter(b => b._id === myBook._id)[0];
                expect(updatedBook.name).equals(newName);
                done();
            })
        })
    })

    describe("delete function", () => {
        let removed:string[] = [];
        before(() => {
            nsp.on("removed", (ids:string[]) => {
                removed = removed.concat(ids);
            })
        })

        after(() => nsp.removeListener("removed"))
        
        it("should broadcast the id of the deleted item", done => {
            expect(books.length).to.be.greaterThan(0);
            let myId = books[0]._id;
            expect(removed.indexOf(myId)).to.equal(-1);
            chai.request(`${baseUrl}`)
            .delete(`/api/books/${myId}`)
            .set("Authorization", token)
            .end((err, res) => {
                expect(res.status).to.equal(200);
                expect(removed.indexOf(myId)).not.to.equal(-1);
                done();
            })
        })
    })
})