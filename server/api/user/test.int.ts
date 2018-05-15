import "mocha";
import {expect} from "chai";
const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
import axios, {AxiosResponse, AxiosError} from "axios"
import config from "../../config/environment"

const baseUrl = "http://localhost:3333";
import {MongoClient} from "mongodb";
import { IUser } from "common/models";


export const removeAllUsers = ():Promise<void> => {
    return MongoClient.connect(`mongodb://${config.db.mongoose.app.host}:${config.db.mongoose.app.port}`)
    .then(client => {
        return client.db(config.db.mongoose.app.dbname)
        .collection("User")
        .deleteMany({})
        .then(res => client.close(true))
    });
}

export const createUser = (name:string, email:string, password:string):Promise<void> => {
    return axios.post(`${baseUrl}/api/user`, {
        name,
        email,
        password
    })
    .then(res => res.data as undefined)
}

export const login = (email, password):Promise<string> => {
    return axios.post(`${baseUrl}/api/auth/local`, {
        email,
        password
    })
    .then(res => res.data.token as string)
}

export const logout = (token:string):Promise<void> => {
    return axios.get(`${baseUrl}/api/auth/logout`, {
        headers: {
            Authorization: token
        }
    })
    .then(res => undefined)
}


describe("User API", () => {
    const userName = "test";
    const email = "test@test.com";
    const password = "testPass";

    before(done => {
        removeAllUsers()
        .then(() => done())
    })

    after(done => {
        removeAllUsers()
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
            .end((err:AxiosError, res) => {
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
            .end((err:AxiosError, res) => {
                expect(res.status).not.to.equal(200);
                done();
            });
        })
    })
    
    describe("get information about me", () => {
        let token:string = "";
        before(done => {
            login(email, password)
            .then(myToken => token = myToken)
            .then(() => done())
        })

        after(done => {
            logout(token)
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
                expect(user.email).to.equal(email)
                expect(user.name).to.equal(userName)
                done();
            })            
        })
    })
})