import "mocha";
import {expect} from "chai";
const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
import {AxiosResponse, AxiosError} from "axios"
import config from "../../config/environment";
import {MongoClient} from "mongodb";
import {login, logout, createUser, removeAllUsers} from "../user/test.int"


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
    const name = "fwalelk",
        email = "weahf@awefj.com",
        password = "230498lkjewrf";
    beforeEach(done => {
        Promise.all([
            removeAllUsers(),
            removeAllBooks()
        ])
        .then(() => createUser(name, email, password))
        .then(() => login(email, password))
        .then(myToken => token = myToken)
        .then(() => done())
        .catch(err => console.error(err))
    });

    afterEach(done => {
        Promise.all([
            removeAllUsers(),
            removeAllBooks()
        ])
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