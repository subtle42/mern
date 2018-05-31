import "mocha";
import {expect} from "chai";
import * as chai from "chai";
import "chai-http";
import * as utils from "./utils"

const baseUrl = utils.getBaseUrl();
import { IUser } from "common/models";



describe("User API", () => {
    const userName = "test";
    const email = "test@test.com";
    const password = "testPass";

    before(done => {
        utils.cleanDb()
        .then(() => done())
    })

    after(done => {
        utils.cleanDb()
        .then(() => done())
    })

    describe("post /api/user", () => {
        it("should create a user", done => {
            chai.request(`${baseUrl}`)
            .post("/api/user")
            .send({
                name: userName,
                email: email,
                password: password
            })
            .then(res => expect(res.status).to.equal(200))
            .then(() => done())
        })
    
        it("should not create a user if the email already exists", done => {
            chai.request(`${baseUrl}`)
            .post("/api/user")
            .send({
                name: userName,
                email: email,
                password: password
            })
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => done())
        })
    })
    
    describe("get /api/user/me", () => {
        let token:string = "";
        const myUser = utils.USERS[1];
        before(done => {
            utils.createUserAndLogin(myUser)
            .then(myToken => token = myToken)
            .then(() => done())
        })

        it("should return an error user if is NOT logged in", done => {
            chai.request(`${baseUrl}`)
            .get('/api/user/me')
            .then(res => expect(res.status).to.equal(401))
            .then(() => done())          
        })

        it("should get current user's info", done => {
            chai.request(`${baseUrl}`)
            .get('/api/user/me')
            .set("Authorization", token)
            .then(res => {
                expect(res.status).to.equal(200);
                const user:IUser = res.body;
                expect(user.email).to.equal(myUser.email)
                expect(user.name).to.equal(myUser.name)
            })
            .then(() => done())
        })
    })
})