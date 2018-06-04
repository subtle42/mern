import {expect} from "chai";
import * as chai from "chai";
import "chai-http";
import { ISource } from "common/models";
import * as utils from "./utils";
import * as fs from "fs"

describe("Source API", () => {
    let tokens:string[] =[],
        userIds:string[] = [];
    const baseUrl = utils.getBaseUrl();

    before(done => {
        Promise.all([
            utils.createUserAndLogin(utils.USERS[0]),
            utils.createUserAndLogin(utils.USERS[1])
        ])
        .then(users => tokens = users)
        .then(() => Promise.all(tokens.map(token => utils.decodeToken(token))))
        .then(decodedTokens => userIds = decodedTokens.map(decoded => decoded._id))
        .then(() => done())
    })

    after(done => {
        utils.cleanDb()
        .then(() => done())
    })

    describe("POST /api/sources", () => {
        it("should return an error if user is NOT logged in", done => {
            chai.request(`${baseUrl}`)
            .post("/api/sources")
            .send({})
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => done())
        })

        it("should return a string", done => {
            chai.request(`${baseUrl}`)
            .post("/api/sources")
            .set("Authorization", tokens[0])
            .attach("file", fs.readFileSync("./integration/data/2012_SAT_RESULTS.csv"), "2012_SAT_RESULTS.csv")
            .then(res => expect(res.status).to.equal(200))
            .then(() => done())
        })
    })

    describe("POST /api/sources", () => {
        let sources:ISource[] = [],
            sourceId:string,
            socket:SocketIOClient.Socket;

        before(done => {
            socket = utils.websocketConnect("sources", tokens[0])
            socket.on("addedOrChanged", (items:ISource[]) => {
                items.forEach(item => {
                    sources = sources.filter(source => source._id !== item._id)
                })
                sources = sources.concat(items);
            })

            utils.createSource(tokens[0], "./integration/data/2012_SAT_RESULTS.csv")
            .then(newId => sourceId = newId)
            .then(id => console.log("id", id))
            .then(() => done())
        })

        it("should return an error if user is NOT logged in", done => {
            chai.request(baseUrl)
            .put("/api/sources")
            .send({})
            .then(res => expect(res.status).to.equal(401))
            .then(() => done())
        })

        it("should return an error if user is NOT owner or editor", done => {
            let mySouce:ISource = sources.filter(s => s._id === sourceId)[0];
            expect(mySouce).not.to.be.undefined;

            chai.request(baseUrl)
            .put("/api/sources")
            .set("authorization", tokens[1])
            .send(mySouce)
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => done())
        })

        xit("should return a success if user is the owner", done => {
            let mySouce:ISource = sources.filter(s => s._id === sourceId)[0];
            expect(mySouce).not.to.be.undefined;
            expect(mySouce.owner).to.equal(userIds[0])

            chai.request(baseUrl)
            .put("/api/sources")
            .set("authorization", tokens[0])
            .send(mySouce)
            .then(res => expect(res.status).to.equal(200))
            .then(() => done())
        })

        xit("should return a success if user is an editor", done => {
            let mySource:ISource = sources.filter(s => s._id === sourceId)[0];
            expect(mySource).not.to.be.undefined;
            expect(mySource.owner).to.equal(userIds[0])
            mySource = {...mySource};
            mySource.editors.push(userIds[1])

            chai.request(baseUrl)
            .put("/api/sources")
            .set("authorization", tokens[0])
            .send(mySource)
            .then(res => expect(res.status).to.equal(200))
            .then(() => mySource.title = "new Updated")
            .then(() => chai.request(baseUrl)
            .put("/api/sources")
            .set("authorization", tokens[1])
            .send(mySource)
            .then(res => expect(res.status).to.equal(200)))
            .then(() => done())
        })

        xit("should return an error if the schema does NOT match", done => {
            let mySource:any = sources.filter(s => s._id === sourceId)[0];
            expect(mySource).not.to.be.undefined;
            mySource = {...mySource};
            mySource.size = [];
            chai.request(baseUrl)
            .put("/api/sources")
            .set("authorization", tokens[0])
            .send(mySource)
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => done())
        })

        xit("should return an error if a user other than the owner tries to change the owner", done => {
            let mySource:ISource = sources.filter(s => s._id === sourceId)[0];
            expect(mySource).not.to.be.undefined;
            expect(mySource.owner).not.to.equal(userIds[1])
            expect(mySource.editors.indexOf(userIds[1])).not.to.equal(-1)
            mySource = {...mySource};
            mySource.owner = userIds[1];

            chai.request(baseUrl)
            .put("/api/sources")
            .set("authorization", tokens[1])
            .send(mySource)
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => done())
        })

        // xit("should return a success if the owner changes the owner field", done => {
        //     let mySource:ISource = sources.filter(s => s._id === sourceId)[0];
        //     expect(mySource).not.to.be.undefined;
        //     expect(mySource.owner).not.to.equal(userIds[1])
        //     mySource = {...mySource};
        //     mySource.owner = userIds[1];
        //     mySource.title = "dantheman"

        //     chai.request(baseUrl)
        //     .put("/api/sources")
        //     .set("authorization", tokens[0])
        //     .send(mySource)
        //     .then(res => expect(res.status).to.equal(200))
        //     .then(() => sources.filter(s => s._id === sourceId)[0])
        //     // .then(a => console.log(a))
        //     .then(updated => expect(updated.owner).to.equal(userIds[1]))
        //     .then(() => done())
        // })
        
    })

    describe("DELETE /api/sources", () => {
        let sourceId:string,
            socket:SocketIOClient.Socket,
            removedIds:string[] = [];


        before(done => {
            socket = utils.websocketConnect("sources", tokens[0])
            socket.on("removed", (ids:string[]) => {
                removedIds = removedIds.concat(ids);
            });

            utils.createSource(tokens[0], "./integration/data/2012_SAT_RESULTS.csv")
            .then(newSourceId => sourceId = newSourceId)
            .then(() => done())
        })

        it("should return an error if user is NOT logged in", done => {
            chai.request(baseUrl)
            .del(`/api/sources/${sourceId}`)
            .then(res => expect(res.status).to.equal(401))
            // .then(() => expect(removedIds.indexOf(sourceId)).to.equal(-1))
            .then(() => done())
        })

        it("should return an error if record does NOT exist", done => {
            chai.request(baseUrl)
            .del(`/api/sources/ERROR`)
            .set("authorization", tokens[0])
            .then(res => expect(res.status).not.to.equal(200))
            // .then(() => expect(removedIds.length).to.equal(0))
            .then(() => done())
        })

        it("should return an error if a user other than owner tries to delete", done => {
            chai.request(baseUrl)
            .del(`/api/sources/${sourceId}`)
            .set("authorization", tokens[1])
            .then(res => expect(res.status).not.to.equal(200))
            // .then(() => expect(removedIds.indexOf(sourceId)).to.equal(-1))
            .then(() => done())
        })

        it("should return a success if source exists and user is owner", done => {
            chai.request(baseUrl)
            .del(`/api/sources/${sourceId}`)
            .set("authorization", tokens[0])
            .then(res => expect(res.status).to.equal(200))
            .then(() => expect(removedIds.indexOf(sourceId)).not.to.equal(-1))
            .then(() => done())
        })
    })

    describe("POST /api/sources/query", () => {
        it("should return an error if user is NOT logged in", done => {
            chai.request(`${baseUrl}`)
            .post("/api/sources/query")
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => done())
        })

        it("should return records", done => {
            chai.request(baseUrl)
            .post("/api/sources")
            .set("Authorization", tokens[0])
            .attach("file", fs.readFileSync("./integration/data/2012_SAT_RESULTS.csv"), "2012_SAT_RESULTS.csv")
            .then(res => {
                expect(res.status).to.equal(200);
                return chai.request(`${baseUrl}`)
                .post("/api/sources/query")
                .set("Authorization", tokens[0])
                .send({
                    sourceId: res.body,
                    measures: [],
                    dimensions: [],
                    filters: []
                })
            })
            .then(res => expect(res.status).to.equal(200))
            .then(() => done())
        })
    })
})