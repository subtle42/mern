import {expect} from "chai";
import * as chai from "chai";
import "chai-http";
import { IWidget, IBook } from "common/models";
import * as utils from "./utils";


xdescribe("Widget API", () => {
    let tokens:string[],
        userIds:string[],
        bookId:string,
        pageId:string,
        sourceId:string;

    before(done => {
        Promise.all(utils.USERS.map(user => utils.createUserAndLogin(user)))
        .then(newTokens => tokens = newTokens)
        .then(tokens => Promise.all(tokens.map(token => utils.decodeToken(token))))
        .then(decoded => userIds = decoded.map(x => x._id))
        .then(() => utils.createBook(tokens[0], "top book"))
        .then(id => bookId = id)
        .then(() => utils.createPage(tokens[0], bookId, "top page"))
        .then(id => pageId = id)
        .then(() => utils.createSource(tokens[0], "./integration/data/2012_SAT_RESULTS.csv"))
        .then(id => sourceId = id)
        .then(() => done())
    })

    after(done => {
        utils.cleanDb()
        .then(() => done())
    })

    describe("POST /api/widgets", () => {
        it("should return an error if user is NOT logged in", done => {
            chai.request(utils.getBaseUrl())
            .post(`/api/widgets`)
            .send({
                pageId,
                sourceId,
                type: "chart"
            })
            .then(res => expect(res.status).to.equal(401))
            .then(() => done())
        })

        it("should retiurn an error if the user does NOT have edit access", done => {
            chai.request(utils.getBaseUrl())
            .post(`/api/widgets`)
            .set("authorization", tokens[1])
            .send({
                pageId,
                sourceId,
                type: "chart"
            })
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => done())
        })

        it("should return a success if user is the owner of the book", done => {
            chai.request(utils.getBaseUrl())
            .post(`/api/widgets`)
            .set("authorization", tokens[0])
            .send({
                pageId,
                sourceId,
                type: "chart"
            })
            .then(res => expect(res.status).to.equal(200))
            .then(() => done())
        })

        it("should return a success if the user has edit access to the book", done => {
            utils.getBook(tokens[0], bookId)
            .then(book =>  {
                book.editors.push(userIds[1])
                return utils.updateBook(tokens[0], book)
            })
            .then(() => chai.request(utils.getBaseUrl())
            .post(`/api/widgets`)
            .set("authorization", tokens[0])
            .send({
                pageId,
                sourceId,
                type: "chart"
            }))
            .then(res => expect(res.status).to.equal(200))
            .then(() => done())
        })
    })

    describe("PUT /api/widgets", () => {
        let widgetId:string,
            widget:IWidget;

        before(done => {
            utils.createWidget(tokens[0], pageId, sourceId, "chart")
            .then(id => widgetId = id)
            .then(() => done())
        })

        beforeEach(done => {
            utils.getWidget(tokens[0], widgetId)
            .then(data => widget = data)
            .then(() => done())
        })

        it("should return an error if user is NOT logged in", done => {
            chai.request(utils.getBaseUrl())
            .put(`/api/widgets`)
            .send(widget)
            .then(res => expect(res.status).to.equal(401))
            .then(() => done())
        })

        it("should return an error if the user does NOT have edit access", done => {
            const test:string = "awlefhqwoefjw";
            widget.dimensions.push(test);
            
            chai.request(utils.getBaseUrl())
            .put(`/api/widgets`)
            .set("authorization", tokens[2])
            .send(widget)
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => utils.getWidget(tokens[0], widgetId))
            .then(data => expect(data.dimensions.filter(x => x === test).length).to.equal(0))
            .then(() => done())
        })

        it("should return a success if the user is the owner of the book", done => {
            const test:string = "works";
            widget.dimensions.push(test);

            chai.request(utils.getBaseUrl())
            .put(`/api/widgets`)
            .set("authorization", tokens[0])
            .send(widget)
            .then(res => expect(res.status).to.equal(200))
            .then(() => utils.getWidget(tokens[0], widgetId))
            .then(data => expect(data.dimensions.filter(x => x === test).length).to.equal(1))
            .then(() => done())
        })

        it("should return a success if the user is an editor of the book", done => {
            const test:string = "editor";
            widget.dimensions.push(test);

            chai.request(utils.getBaseUrl())
            .put(`/api/widgets`)
            .set("authorization", tokens[1])
            .send(widget)
            .then(res => expect(res.status).to.equal(200))
            .then(() => utils.getWidget(tokens[0], widgetId))
            .then(data => expect(data.dimensions.filter(x => x === test).length).to.equal(1))
            .then(() => done())
        })
    })

    describe("DELETE /api/widgets", () => {
        let book:IBook;
        before(done => {
            utils.getBook(tokens[0], bookId)
            .then(data => book = data)
            .then(() => done())
        })

        it("should return an error if user is NOT logged in", done => {
            chai.request(utils.getBaseUrl())
            .del(`/api/widgets/asdf`)
            .then(res => expect(res.status).to.equal(401))
            .then(() => done())
        })

        it("should return an error if widget does NOT exist", done => {
            chai.request(utils.getBaseUrl())
            .del(`/api/widgets/asdf`)
            .set("authorization", tokens[0])
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => done())
        })
        
        it("should return an error if user does NOT have edit access", done => {
            let widgetId:string;
            expect(book.owner).not.to.equal(userIds[2])
            expect(book.editors.indexOf(userIds[2])).to.equal(-1)
            
            utils.createWidget(tokens[0], pageId, sourceId, "chart")
            .then(id => widgetId = id)
            .then(() => chai.request(utils.getBaseUrl())
            .del(`/api/widgets/${widgetId}`)
            .set("authorization", tokens[2]))
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => utils.getWidget(tokens[0], widgetId))
            .then(data => expect(data._id).to.equal(widgetId))
            .then(() => done())
        })

        it("should return a success if the user has owner access", done => {
            let widgetId:string;
            expect(book.owner).to.equal(userIds[0])

            utils.createWidget(tokens[0], pageId, sourceId, "chart")
            .then(id => widgetId = id)
            .then(() => chai.request(utils.getBaseUrl())
            .del(`/api/widgets/${widgetId}`)
            .set("authorization", tokens[0]))
            .then(res => expect(res.status).to.equal(200))
            .then(() => utils.getWidget(tokens[0], widgetId))
            .catch(res => expect(res.status).not.to.equal(200))
            .then(() => done())
        })

        it("should return a success if the user has edit access", done => {
            let widgetId:string;
            expect(book.editors.indexOf(userIds[1])).not.to.equal(-1)

            utils.createWidget(tokens[0], pageId, sourceId, "chart")
            .then(id => widgetId = id)
            .then(() => chai.request(utils.getBaseUrl())
            .del(`/api/widgets/${widgetId}`)
            .set("authorization", tokens[1]))
            .then(res => expect(res.status).to.equal(200))
            .then(() => utils.getWidget(tokens[0], widgetId))
            .catch(res => expect(res.status).not.to.equal(200))
            .then(() => done())
        })
    })
})

xdescribe("Widget Channel", () => {
    let bookId:string,
        tokens:string[],
        userIds:string[],
        pageId:string,
        sourceId:string;

    before(done => {
        utils.cleanDb()
        .then(() => Promise.all(utils.USERS.map(user => utils.createUserAndLogin(user))))
        .then(newTokens => tokens = newTokens)
        .then(tokens => Promise.all(tokens.map(token => utils.decodeToken(token))))
        .then(decoded => userIds = decoded.map(x => x._id))
        .then(() => utils.createBook(tokens[0], "top book"))
        .then(id => bookId = id)
        .then(() => utils.createPage(tokens[0], bookId, "top page"))
        .then(id => pageId = id)
        .then(() => utils.createSource(tokens[0], "./integration/data/2012_SAT_RESULTS.csv"))
        .then(id => sourceId = id)
        .then(() => done())
    })

    after(done => {
        utils.cleanDb()
        .then(() => done())
    })

    describe("authorization", () => {
        it("should NOT let you join a room if user does NOT have access to the parent book", done => {
            let socket:SocketIOClient.Socket = utils.websocketConnect("widgets", tokens[2])
            socket.on("message", data => {
                socket.disconnect();
                done();
            })

            socket.emit("join", pageId)
        })

        it("should return records if user is the owner of the book", done => {
            let socket:SocketIOClient.Socket = utils.websocketConnect("widgets", tokens[0])
            socket.on("addedOrChanged", data => {
                socket.disconnect();
                expect(data).not.to.be.undefined;
                done();
            })

            socket.emit("join", pageId)
        })

        it("should return recores if user has edit access to the book", done => {
            let socket:SocketIOClient.Socket;
            
            utils.getBook(tokens[0], bookId)
            .then(book => {
                book.editors.push(userIds[1])
                return utils.updateBook(tokens[0], book)
            })
            .then(() => {
                socket = utils.websocketConnect("widgets", tokens[1])
                socket.on("addedOrChanged", data => {
                    socket.disconnect();
                    expect(data).not.to.be.undefined;
                    done();
                })

                socket.emit("join", pageId)
            })
        })

        it("should return records if user has viewer access to the book", done => {
            let socket:SocketIOClient.Socket;

            utils.getBook(tokens[0], bookId)
            .then(book => {
                book.viewers.push(userIds[2])
                return utils.updateBook(tokens[0], book)
            })
            .then(() => {
                socket = utils.websocketConnect("widgets", tokens[2])
                socket.on("addedOrChanged", data => {
                    socket.disconnect();
                    expect(data).not.to.be.undefined;
                    done();
                })

                socket.emit("join", pageId)
            })
        })

        it("should return records if book is public", done => {
            let socket:SocketIOClient.Socket;

            utils.getBook(tokens[0], bookId)
            .then(book => {
                book.editors = [];
                book.viewers = [];
                book.isPublic = true;
                return utils.updateBook(tokens[0], book)
            })
            .then(() => {
                socket = utils.websocketConnect("widgets", tokens[2])
                socket.on("addedOrChanged", data => {
                    socket.disconnect();
                    expect(data).not.to.be.undefined;
                    done();
                })

                socket.emit("join", pageId)
            })
        })

        it("should return an error if user tries to join a room that does not exist", done => {
            let socket:SocketIOClient.Socket = utils.websocketConnect("widgets", tokens[2]);

            socket.on("message", data => {
                socket.disconnect();
                expect(data).not.to.be.undefined;
                done();
            })

            socket.emit("join", "badId")
        })
    })

    describe("addedOrChanged channel", () => {
        let widgetIds:string[];

        before(done => {
            Promise.all([
                utils.createWidget(tokens[0], pageId, sourceId, "chart"),
                utils.createWidget(tokens[0], pageId, sourceId, "chart")
            ])
            .then(ids => widgetIds = ids)
            .then(() => done())
        })

        it("should return all widgets in a page when joining a page's room", done => {
            let socket:SocketIOClient.Socket = utils.websocketConnect("widgets", tokens[0]);
            socket.on("addedOrChanged", (data:IWidget[]) => {
                socket.disconnect()
                expect(data.filter(x => x._id === widgetIds[0]).length).to.equal(1)
                expect(data.filter(x => x._id === widgetIds[1]).length).to.equal(1)
                done();
            })

            socket.emit("join", pageId)
        })

        it("should return a record when a widget is added", done => {
            let first:boolean = true;
            let type:string = "kfjwawjecpawe"
            let socket:SocketIOClient.Socket = utils.websocketConnect("widgets", tokens[0]);

            socket.on("addedOrChanged", (data:IWidget[]) => {
                if (first === true) {
                    first = false;
                    utils.createWidget(tokens[0], pageId, sourceId, type)
                }
                else {
                    socket.disconnect()
                    expect(data[0].type).to.equal(type)
                    done()
                }
            })

            socket.emit("join", pageId)
        })

        it("should return a record when a widget is updated", done => {
            let first:boolean = true;
            let type:string = "aaaaaawcewaef"
            let socket:SocketIOClient.Socket = utils.websocketConnect("widgets", tokens[0]);

            socket.on("addedOrChanged", (data:IWidget[]) => {
                if (first === true) {
                    first = false;
                    utils.getWidget(tokens[0], widgetIds[0])
                    .then(widget => {
                        widget.type = type;
                        return utils.updateWidget(tokens[0], widget)
                    })
                }
                else {
                    socket.disconnect()
                    expect(data[0].type).to.equal(type)
                    done()
                }
            })

            socket.emit("join", pageId)
        })
    })

    describe("removed channel", () => {
        it("should return the id of a deleted widget", done => {
            let widgetId:string;
            let socket:SocketIOClient.Socket = utils.websocketConnect("widgets", tokens[0])
            socket.on("removed", (ids:string[]) => {
                socket.disconnect();
                expect(ids[0]).to.equal(widgetId);
                done();
            })
            socket.emit("join", pageId);

            utils.createWidget(tokens[0], pageId, sourceId, "chart")
            .then(id => widgetId = id)
            .then(() => utils.deleteWidget(tokens[0], widgetId))
        })
    })
})