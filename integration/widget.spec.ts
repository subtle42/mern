import * as chai from 'chai'
import 'chai-http'
import { IWidget, IBook } from 'common/models'
import * as utils from './utils'
import * as path from 'path'
const expect = chai.expect

describe('Widget API', () => {
    let tokens: string[]
    let userIds: string[]
    let bookId: string
    let pageId: string
    let sourceId: string
    let server: Express.Application

    before(() => {
        return utils.testSetup()
        .then(setup => ({ userIds, tokens, server } = setup))
        .then(() => utils.createBook(tokens[0], 'top book'))
        .then(id => bookId = id)
        .then(() => utils.createPage(tokens[0], bookId, 'top page'))
        .then(id => pageId = id)
        .then(() => utils.createSource(tokens[0], path.join(__dirname, 'data/2012_SAT_RESULTS.csv')))
        .then(id => sourceId = id)
    })

    after(() => {
        return utils.cleanDb()
    })

    describe('POST /api/widgets', () => {
        it('should return an error if user is NOT logged in', () => {
            return chai.request(server)
            .post(`/api/widgets`)
            .send({
                pageId,
                sourceId,
                type: 'chart'
            })
            .then(res => expect(res.status).to.equal(401))
        })

        it('should retiurn an error if the user does NOT have edit access', () => {
            return chai.request(server)
            .post(`/api/widgets`)
            .set('authorization', tokens[1])
            .send({
                pageId,
                sourceId,
                type: 'chart'
            })
            .then(res => expect(res.status).not.to.equal(200))
        })

        it('should return a success if user is the owner of the book', () => {
            return chai.request(server)
            .post(`/api/widgets`)
            .set('authorization', tokens[0])
            .send({
                pageId,
                sourceId,
                type: 'chart'
            })
            .then(res => expect(res.status).to.equal(200))
        })

        it('should return a success if the user has edit access to the book', () => {
            return utils.getBook(tokens[0], bookId)
            .then(book => {
                book.editors.push(userIds[1])
                return utils.updateBook(tokens[0], book)
            })
            .then(() => chai.request(server)
            .post(`/api/widgets`)
            .set('authorization', tokens[0])
            .send({
                pageId,
                sourceId,
                type: 'chart'
            }))
            .then(res => expect(res.status).to.equal(200))
        })
    })

    describe('PUT /api/widgets', () => {
        let widgetId: string
        let widget: IWidget

        before(() => {
            return utils.createWidget(tokens[0], pageId, sourceId, 'chart')
            .then(id => widgetId = id)
        })

        beforeEach(() => {
            return utils.getWidget(tokens[0], widgetId)
            .then(data => widget = data)
        })

        it('should return an error if user is NOT logged in', () => {
            return chai.request(server)
            .put(`/api/widgets`)
            .send(widget)
            .then(res => expect(res.status).to.equal(401))
        })

        it('should return an error if the user does NOT have edit access', () => {
            const test: string = 'awlefhqwoefjw'
            widget.dimensions.push(test)

            return chai.request(server)
            .put(`/api/widgets`)
            .set('authorization', tokens[2])
            .send(widget)
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => utils.getWidget(tokens[0], widgetId))
            .then(data => expect(data.dimensions.filter(x => x === test).length).to.equal(0))
        })

        it('should return a success if the user is the owner of the book', () => {
            const test: string = 'works'
            widget.dimensions.push(test)

            return chai.request(server)
            .put(`/api/widgets`)
            .set('authorization', tokens[0])
            .send(widget)
            .then(res => expect(res.status).to.equal(200))
            .then(() => utils.getWidget(tokens[0], widgetId))
            .then(data => expect(data.dimensions.filter(x => x === test).length).to.equal(1))
        })

        it('should return a success if the user is an editor of the book', () => {
            const test: string = 'editor'
            widget.dimensions.push(test)

            return chai.request(server)
            .put(`/api/widgets`)
            .set('authorization', tokens[1])
            .send(widget)
            .then(res => expect(res.status).to.equal(200))
            .then(() => utils.getWidget(tokens[0], widgetId))
            .then(data => expect(data.dimensions.filter(x => x === test).length).to.equal(1))
        })
    })

    describe('DELETE /api/widgets', () => {
        let book: IBook
        before(() => {
            return utils.getBook(tokens[0], bookId)
            .then(data => book = data)
        })

        it('should return an error if user is NOT logged in', () => {
            return chai.request(server)
            .del(`/api/widgets/asdf`)
            .then(res => expect(res.status).to.equal(401))
        })

        it('should return an error if widget does NOT exist', () => {
            return chai.request(server)
            .del(`/api/widgets/asdf`)
            .set('authorization', tokens[0])
            .then(res => expect(res.status).not.to.equal(200))
        })

        it('should return an error if user does NOT have edit access', () => {
            let widgetId: string
            expect(book.owner).not.to.equal(userIds[2])
            expect(book.editors.indexOf(userIds[2])).to.equal(-1)

            return utils.createWidget(tokens[0], pageId, sourceId, 'chart')
            .then(id => widgetId = id)
            .then(() => chai.request(server)
            .del(`/api/widgets/${widgetId}`)
            .set('authorization', tokens[2]))
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => utils.getWidget(tokens[0], widgetId))
            .then(data => expect(data._id).to.equal(widgetId))
        })

        it('should return a success if the user has owner access', () => {
            let widgetId: string
            expect(book.owner).to.equal(userIds[0])

            return utils.createWidget(tokens[0], pageId, sourceId, 'chart')
            .then(id => widgetId = id)
            .then(() => chai.request(server)
            .del(`/api/widgets/${widgetId}`)
            .set('authorization', tokens[0]))
            .then(res => expect(res.status).to.equal(200))
            .then(() => utils.getWidget(tokens[0], widgetId))
            .catch(res => expect(res.status).not.to.equal(200))
        })

        it('should return a success if the user has edit access', () => {
            let widgetId: string
            expect(book.editors.indexOf(userIds[1])).not.to.equal(-1)

            return utils.createWidget(tokens[0], pageId, sourceId, 'chart')
            .then(id => widgetId = id)
            .then(() => chai.request(server)
            .del(`/api/widgets/${widgetId}`)
            .set('authorization', tokens[1]))
            .then(res => expect(res.status).to.equal(200))
            .then(() => utils.getWidget(tokens[0], widgetId))
            .catch(res => expect(res.status).not.to.equal(200))
        })
    })
})

describe('Widget Channel', () => {
    let bookId: string
    let tokens: string[]
    let userIds: string[]
    let pageId: string
    let sourceId: string

    before(() => {
        return utils.testSetup()
        .then(setup => ({ userIds, tokens } = setup))
        .then(() => utils.createBook(tokens[0], 'top book'))
        .then(id => bookId = id)
        .then(() => utils.createPage(tokens[0], bookId, 'top page'))
        .then(id => pageId = id)
        .then(() => utils.createSource(tokens[0], path.join(__dirname, 'data/2012_SAT_RESULTS.csv')))
        .then(id => sourceId = id)
    })

    after(() => {
        return utils.cleanDb()
    })

    describe('authorization', () => {
        it('should NOT let you join a room if user does NOT have access to the parent book', done => {
            let socket: SocketIOClient.Socket = utils.websocketConnect('widgets', tokens[2])
            socket.on('message', data => {
                socket.disconnect()
                done()
            })

            socket.emit('join', pageId)
        })

        it('should return records if user is the owner of the book', done => {
            let socket: SocketIOClient.Socket = utils.websocketConnect('widgets', tokens[0])
            socket.on('addedOrChanged', data => {
                socket.disconnect()
                expect(data).not.to.equal(undefined)
                done()
            })

            socket.emit('join', pageId)
        })

        it('should return recores if user has edit access to the book', done => {
            let socket: SocketIOClient.Socket

            utils.getBook(tokens[0], bookId)
            .then(book => {
                book.editors.push(userIds[1])
                return utils.updateBook(tokens[0], book)
            })
            .then(() => {
                socket = utils.websocketConnect('widgets', tokens[1])
                socket.on('addedOrChanged', data => {
                    socket.disconnect()
                    expect(data).not.to.equal(undefined)
                    done()
                })

                socket.emit('join', pageId)
            })
        })

        it('should return records if user has viewer access to the book', done => {
            let socket: SocketIOClient.Socket

            utils.getBook(tokens[0], bookId)
            .then(book => {
                book.viewers.push(userIds[2])
                return utils.updateBook(tokens[0], book)
            })
            .then(() => {
                socket = utils.websocketConnect('widgets', tokens[2])
                socket.on('addedOrChanged', data => {
                    socket.disconnect()
                    expect(data).not.to.equal(undefined)
                    done()
                })

                socket.emit('join', pageId)
            })
        })

        it('should return records if book is public', done => {
            let socket: SocketIOClient.Socket

            utils.getBook(tokens[0], bookId)
            .then(book => {
                book.editors = []
                book.viewers = []
                book.isPublic = true
                return utils.updateBook(tokens[0], book)
            })
            .then(() => {
                socket = utils.websocketConnect('widgets', tokens[2])
                socket.on('addedOrChanged', data => {
                    socket.disconnect()
                    expect(data).not.to.equal(undefined)
                    done()
                })

                socket.emit('join', pageId)
            })
        })

        it('should return an error if user tries to join a room that does not exist', done => {
            let socket: SocketIOClient.Socket = utils.websocketConnect('widgets', tokens[2])

            socket.on('message', data => {
                socket.disconnect()
                expect(data).not.to.equal(undefined)
                done()
            })

            socket.emit('join', 'badId')
        })
    })

    describe('addedOrChanged channel', () => {
        let widgetIds: string[]

        before(() => {
            return Promise.all([
                utils.createWidget(tokens[0], pageId, sourceId, 'chart'),
                utils.createWidget(tokens[0], pageId, sourceId, 'chart')
            ])
            .then(ids => widgetIds = ids)
        })

        it("should return all widgets in a page when joining a page's room", done => {
            let socket: SocketIOClient.Socket = utils.websocketConnect('widgets', tokens[0])
            socket.on('addedOrChanged', (data: IWidget[]) => {
                socket.disconnect()
                expect(data.filter(x => x._id === widgetIds[0]).length).to.equal(1)
                expect(data.filter(x => x._id === widgetIds[1]).length).to.equal(1)
                done()
            })

            socket.emit('join', pageId)
        })

        it('should return a record when a widget is added', done => {
            let first: boolean = true
            let type: string = 'kfjwawjecpawe'
            let socket: SocketIOClient.Socket = utils.websocketConnect('widgets', tokens[0])

            socket.on('addedOrChanged', (data: IWidget[]) => {
                if (first === true) {
                    first = false
                    utils.createWidget(tokens[0], pageId, sourceId, type)
                } else {
                    socket.disconnect()
                    expect(data[0].type).to.equal(type)
                    done()
                }
            })

            socket.emit('join', pageId)
        })

        it('should return a record when a widget is updated', done => {
            let first: boolean = true
            let type: string = 'aaaaaawcewaef'
            let socket: SocketIOClient.Socket = utils.websocketConnect('widgets', tokens[0])

            socket.on('addedOrChanged', (data: IWidget[]) => {
                if (first === true) {
                    first = false
                    utils.getWidget(tokens[0], widgetIds[0])
                    .then(widget => {
                        widget.type = type
                        return utils.updateWidget(tokens[0], widget)
                    })
                } else {
                    socket.disconnect()
                    expect(data[0].type).to.equal(type)
                    done()
                }
            })

            socket.emit('join', pageId)
        })
    })

    describe('removed channel', () => {
        it('should return the id of a deleted widget', done => {
            let widgetId: string
            let socket: SocketIOClient.Socket = utils.websocketConnect('widgets', tokens[0])
            socket.on('removed', (ids: string[]) => {
                socket.disconnect()
                expect(ids[0]).to.equal(widgetId)
                done()
            })
            socket.emit('join', pageId)

            utils.createWidget(tokens[0], pageId, sourceId, 'chart')
            .then(id => widgetId = id)
            .then(() => utils.deleteWidget(tokens[0], widgetId))
        })
    })
})
