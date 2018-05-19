import "mocha";
import {expect} from "chai";
const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
import * as utils from "./utils"
import { IPage } from "common/models";
import { timeout } from "d3";

describe("Page API", () => {
    const userName = "test",
        email = "test@test.com",
        password = "asdf";
    let token:string,
        bookId:string,
        nsp:SocketIOClient.Socket,
        pages = [];

    before(done => {
        utils.cleanDb()
        .then(() => utils.createUserAndLogin(utils.USERS[1]))
        
        .then(myToken => token = myToken)
        .then(() => utils.createBook(token, "myBook"))
        .then(id => bookId = id)
        .then(() => {
            nsp = utils.websocketConnect("pages", token)
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

    describe("Create function", () => {
        it("should return the created pageId", done => {
            chai.request(utils.getBaseUrl())
            .post("/api/pages")
            .set("Authorization", token)
            .send({
                name: "afwehjlkw",
                bookId: bookId
            })
            .end((err, res) => {
                expect(res.status).to.equal(200);
                const myId = JSON.parse(res.text);
                timeout(() => {
                    expect(pages.filter(p => p._id === myId).length).to.equal(1);
                    done();
                }, 20)
            })            
        })
    })
})