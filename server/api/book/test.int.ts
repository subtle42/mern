import "mocha";
import {expect} from "chai";
const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
import {AxiosResponse, AxiosError} from "axios"
import * as io from "socket.io-client";
import config from "../../config/environment";
import {MongoClient} from "mongodb";
import {login, logout, createUser, removeAllUsers} from "../user/test.int"
import { IBook } from "common/models";
import * as jwt from "jsonwebtoken";
import axios from "axios"


const baseUrl = "http://localhost:3333";
export const removeAllBooks = ():Promise<void> => {
    return MongoClient.connect(`mongodb://${config.db.mongoose.app.host}:${config.db.mongoose.app.port}`)
    .then(client => {
        return client.db(config.db.mongoose.app.dbname)
        .collection("Book")
        .deleteMany({})
        .then(res => client.close(true))
    });
}

describe("Book API", () => {
    let token:string = "";
    let nsp:SocketIOClient.Socket;
    let myId:string;
    let books:IBook[] =[];

    const name = "fwalelk",
        email = "weahf@awefj.com",
        password = "230498lkjewrf";
    before(done => {
        Promise.all([
            removeAllUsers(),
            removeAllBooks()
        ])
        .then(() => createUser(name, email, password))
        .then(() => login(email, password))
        .then(myToken => token = myToken)
        .then(() => {
            jwt.verify(token, config.shared.secret, (err, decoded:any) => {
                if (err) return;
                myId = decoded._id;
            })
        })
        .then(() => {
            nsp = io.connect(`${baseUrl}/books`, {
                query: {token}
            })
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
        Promise.all([
            removeAllUsers(),
            removeAllBooks()
        ])
        .then(() => nsp.disconnect().close())
        .then(() => done())
    });

    describe("create function", () => {
        const testName = "unitTest";

        it("should throw an error if not logged in", done => {
            chai.request(`${baseUrl}`)
            .post("/api/books")
            .send({name: testName})
            .end((err:AxiosError, res) => {
                expect(res.status).not.to.equal(200);
                done();
            })
        })
        
        it("should create a new book", done => {
            chai.request(`${baseUrl}`)
            .post("/api/books")
            .set("Authorization", token)
            .send({name: testName})
            .end((err:AxiosError, res) => {
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