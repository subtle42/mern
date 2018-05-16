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
            // removeAllUsers(),
            // removeAllBooks()
        ])
        // .then(() => nsp.disconnect().close())
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

    


    // it("should do something", () => {
    //     expect(1).to.equal(1);
    // });

    // it("should make a REST call", done => {
    //     chai.request("http://localhost:3333")
    //     .get("/")
    //     .end((err:AxiosError, res:AxiosResponse) => {
    //         expect(err).to.equal(null);
    //         // console.log(res.text)
    //         done();
    //     })
    // })
})