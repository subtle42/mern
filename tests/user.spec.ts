import "mocha";
import {expect} from "chai";
const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
import * as utils from "./utils";

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

    describe("create user", () => {
        it("should create a user", done => {
            chai.request(`${baseUrl}`)
            .post("/api/user")
            .send({
                name: userName,
                email: email,
                password: password
            })
            .end((err, res) => {
                expect(res.status).to.equal(200);
                done();
            });
        })
    
        it("should not create a user if the email already exists", done => {
            chai.request(`${baseUrl}`)
            .post("/api/user")
            .send({
                name: userName,
                email: email,
                password: password
            })
            .end((err, res) => {
                expect(res.status).not.to.equal(200);
                done();
            });
        })
    })
    
    describe("get information about me", () => {
        let token:string = "";
        const myUser = utils.USERS[1];
        before(done => {
            utils.createUserAndLogin(myUser)
            .then(myToken => token = myToken)
            .then(() => done())
        })

        it("should throw an error if not logged in", done => {
            chai.request(`${baseUrl}`)
            .get('/api/user/me')
            .send()
            .end((err, res) => {
                expect(res.status).not.to.equal(200);
                done();
            })            
        })

        it("should get current user's info", done => {
            chai.request(`${baseUrl}`)
            .get('/api/user/me')
            .set("Authorization", token)
            .send()
            .end((err, res) => {
                expect(res.status).to.equal(200);
                const user:IUser = JSON.parse(res.text)
                expect(user.email).to.equal(myUser.email)
                expect(user.name).to.equal(myUser.name)
                done();
            })            
        })
    })
})