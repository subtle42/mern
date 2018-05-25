import "mocha";
import {expect} from "chai";
const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
import * as utils from "./utils"
import { IPage } from "common/models";

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

    describe("post /api/pages", () => {
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
                setTimeout(() => {
                    expect(pages.filter(p => p._id === myId).length).to.equal(1);
                    done();
                }, 20)
            })            
        })

        xit("should send a broadcast on the addedOrChanged channel of the sent book", () => {})
        xit("should NOT send a broadcast on the addedOrChanged channel of a different book", () => {})
    })

    describe("put /api/pages", () => {
        xit("should return a success", () => {})
        xit("should return a success if user has owner access", () => {})
        xit("should return a success if user has edit access", () => {})
        xit("should return a failure if user has view access", () => {})
        xit("should return a failure if schema does not match", () => {})
        xit("should return a failure user is not logged in", () => {})
        xit("should send a broadcast in the book's room", () => {})
        xit("should NOT send a broadcast to any other book's room", () => {})
    })

    describe("delete /api/pages", () => {
        xit("should send back a success", () => {})
        xit("should return a failure if user is not logged in", () => {})
        xit("should recieve broadcast on the delete channel if in that book room", () => {})
        xit("should NOT broadcast on the removed channel if NOT in the same book room", () => {})
        xit("should NOT return a success if user is NOT the owner", () => {})
    })
})