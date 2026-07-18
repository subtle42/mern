import {describe, before, after, it, beforeEach} from 'node:test'
import * as utils from '../../testUtils'
import { FastifyInstance } from 'fastify'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { IWidget } from './model'
import { IBook } from '../book/model'

describe('Widget API', () => {
    let tokens: string[]
    let userIds: string[]
    let server: FastifyInstance
    let db: MongoMemoryServer
    let bookId: string
    let pageId: string
    let sourceId: string

    before(async() => {
        ({server, db, userIds, tokens} = await utils.testSetup())

        bookId = await utils.createBook(server, tokens[0], 'top book')
        pageId = await utils.createPage(server, tokens[0], bookId, 'top page')
        sourceId = await utils.createSource(server, tokens[0], '../integration/data/2012_SAT_RESULTS.csv')
    })

    after(async() => {
        await utils.testCleanup(server, db)
    })

    describe('POST /api/widgets', () => {
        it('should return an error if user is NOT logged in', async(t) => {
            const res = await server.inject()
                .post(`/api/widgets`)
                .body({
                    pageId,
                    sourceId,
                    type: 'histogram'
                })
            t.assert.equal(res.statusCode, 401)
        })

        it('should retiurn an error if the user does NOT have edit access', async(t) => {
            const res = await server.inject()
                .post(`/api/widgets`)
                .headers({authorization: tokens[1]})
                .body({
                    pageId,
                    sourceId,
                    type: 'histogram'
                })
            t.assert.notEqual(res.statusCode, 200)
        })

        it('should return a success if user is the owner of the book', async(t) => {
            const res = await server.inject()
                .post(`/api/widgets`)
                .headers({authorization: tokens[0]})
                .body({
                    pageId,
                    sourceId,
                    type: 'histogram'
                })
            t.assert.equal(res.statusCode, 200)
        })

        it('should return a success if the user has edit access to the book', async(t) => {
            const myBook = await utils.getBook(server, tokens[0], bookId)
            myBook.editors.push(userIds[1])
            await utils.updateBook(server, tokens[0], myBook)

            const res = await server.inject()
                .post('/api/widgets')
                .headers({authorization: tokens[1]})
                .body({
                    pageId,
                    sourceId,
                    type: 'histogram'
                })
            console.log(res.body)
            t.assert.equal(res.statusCode, 200)
        })
    })

    describe('PUT /api/widgets', () => {
        let widgetId: string
        let widget: IWidget

        before(async() => {
            widgetId = await utils.createWidget(server, tokens[0], pageId, sourceId, 'histogram')
        })

        beforeEach(async() => {
            widget = await utils.getWidget(server, tokens[0], widgetId)
        })

        it('should return an error if user is NOT logged in', async(t) => {
            const res = await server.inject()
                .put(`/api/widgets`)
                .body(widget)
            t.assert.equal(res.statusCode, 401)
        })

        it('should return an error if the user does NOT have edit access', async(t) => {
            const test: string = 'awlefhqwoefjw'
            widget.dimensions.push(test)

            const res = await server.inject()
                .put('/api/widgets')
                .headers({authorization: tokens[2]})
                .body(widget)
            t.assert.notEqual(res.statusCode, 200)
            const data = await utils.getWidget(server, tokens[0], widgetId)
            t.assert.equal(data.dimensions.filter(x => x === test).length, 0)
        })

        it('should return a success if the user is the owner of the book', async(t) => {
            const test: string = 'works'
            widget.dimensions.push(test)

            const res = await server.inject()
                .put('/api/widgets')
                .headers({authorization: tokens[0]})
                .body(widget)
            t.assert.equal(res.statusCode, 200)
            const data = await utils.getWidget(server, tokens[0], widgetId)
            t.assert.equal(data.dimensions.filter(x => x === test).length, 1)
        })

        it('should return a success if the user is an editor of the book', async(t) => {
            const test: string = 'editor'
            widget.dimensions.push(test)

            const res = await server.inject()
                .put('/api/widgets')
                .headers({authorization: tokens[1]})
                .body(widget)
            t.assert.equal(res.statusCode, 200)
            const data = await utils.getWidget(server, tokens[0], widgetId)
            t.assert.equal(data.dimensions.filter(x => x === test).length, 1)
        })
    })

    describe('DELETE /api/widgets', () => {
        let book: IBook
        before(async() => {
            book = await utils.getBook(server, tokens[0], bookId)
        })

        it('should return an error if user is NOT logged in', async(t) => {
            const res = await server.inject()
                .delete(`/api/widgets/asdf/${pageId}/${bookId}`)
            t.assert.equal(res.statusCode, 401)
        })

        it('should return an error if user does NOT have edit access', async(t) => {
            t.assert.notEqual(book.owner, userIds[2])
            t.assert.equal(book.editors.includes(userIds[2]), false)

            const widgetId = await utils.createWidget(server, tokens[0], pageId, sourceId, 'histogram')
            const res = await server.inject()
                .delete(`/api/widgets/${widgetId}/${pageId}/${bookId}`)
                .headers({authorization: tokens[2]})
            t.assert.notEqual(res.statusCode, 200)
            const data = await utils.getWidget(server, tokens[0], widgetId)
            t.assert.equal(data._id, widgetId)
        })

        it('should return a success if the user has owner access', async(t) => {
            t.assert.equal(book.owner, userIds[0])
            const widgetId = await utils.createWidget(server, tokens[0], pageId, sourceId, 'histogram')
            const res = await server.inject()
                .delete(`/api/widgets/${widgetId}/${pageId}/${bookId}`)
                .headers({authorization: tokens[0]})
            t.assert.equal(res.statusCode, 200)
            const data: any = await utils.getWidget(server, tokens[0], widgetId)
            t.assert.notEqual(data.statusCode, 200)
        })

        it('should return a success if the user has edit access', async(t) => {
            t.assert.equal(book.editors.includes(userIds[1]), true)
            const widgetId = await utils.createWidget(server, tokens[0], pageId, sourceId, 'histogram')
            const res = await server.inject()
                .delete(`/api/widgets/${widgetId}/${pageId}/${bookId}`)
                .headers({authorization: tokens[1]})
            t.assert.equal(res.statusCode, 200)
            const data: any = await utils.getWidget(server, tokens[0], widgetId)
            t.assert.notEqual(data.statusCode, 200)
        })
    })
})

describe('Widget Channel', () => {
    let bookId: string
    let tokens: string[]
    let pageId: string
    let sourceId: string
    let userIds: string[]
    let server: FastifyInstance
    let db: MongoMemoryServer

    before(async() => {
        ({server, db, userIds, tokens} = await utils.testSetup())

        bookId = await utils.createBook(server, tokens[0], 'top book')
        pageId = await utils.createPage(server, tokens[0], bookId, 'top page')
        sourceId = await utils.createSource(server, tokens[0], '../integration/data/2012_SAT_RESULTS.csv')
    })

    after(() => {
        return utils.testCleanup(server, db)
    })

    describe('authorization', () => {
        it('should NOT let you join a room if user does NOT have access to the parent book', (t, done) => {
            const socket = utils.websocketConnect(server, 'widgets', tokens[2])
            socket.on('message', data => {
                socket.disconnect()
                done()
            })
            socket.emit('join', pageId)
        })

        it('should return records if user is the owner of the book', (t, done) => {
            const socket = utils.websocketConnect(server, 'widgets', tokens[0])
            socket.on('addedOrChanged', data => {
                socket.disconnect()
                t.assert.notEqual(data, undefined)
                done()
            })
            socket.emit('join', pageId)
        })

        it('should return recores if user has edit access to the book', (t, done) => {
            utils.getBook(server, tokens[0], bookId)
            .then(book => {
                book.editors.push(userIds[1])
                return utils.updateBook(server, tokens[0], book)
            })
            .then(() => {
                const socket = utils.websocketConnect(server, 'widgets', tokens[1])
                socket.on('addedOrChanged', data => {
                    socket.disconnect()
                    t.assert.notEqual(data, undefined)
                    done()
                })
                socket.emit('join', pageId)
            })
        })

        it('should return records if user has viewer access to the book', (t, done) => {
            utils.getBook(server, tokens[0], bookId)
            .then(book => {
                book.viewers.push(userIds[2])
                return utils.updateBook(server, tokens[0], book)
            })
            .then(() => {
                const socket = utils.websocketConnect(server, 'widgets', tokens[2])
                socket.on('addedOrChanged', data => {
                    socket.disconnect()
                    t.assert.notEqual(data, undefined)
                    done()
                })
                socket.emit('join', pageId)
            })
        })

        it('should return records if book is public', (t, done) => {
            utils.getBook(server, tokens[0], bookId)
            .then(book => {
                book.editors = []
                book.viewers = []
                book.isPublic = true
                return utils.updateBook(server, tokens[0], book)
            })
            .then(() => {
                const socket = utils.websocketConnect(server, 'widgets', tokens[2])
                socket.on('addedOrChanged', data => {
                    socket.disconnect()
                    t.assert.notEqual(data, undefined)
                    done()
                })
                socket.emit('join', pageId)
            })
        })

        it('should return an error if user tries to join a room that does not exist', (t, done) => {
            const socket = utils.websocketConnect(server, 'widgets', tokens[2])

            socket.on('message', data => {
                socket.disconnect()
                t.assert.notEqual(data, undefined)
                done()
            })
            socket.emit('join', 'badId')
        })
    })

    describe('addedOrChanged channel', () => {
        const widgetIds: string[] = []

        before(async() => {
            const id1 = await utils.createWidget(server, tokens[0], pageId, sourceId, 'histogram')
            const id2 = await utils.createWidget(server, tokens[0], pageId, sourceId, 'histogram')
            widgetIds.push(id1, id2)
        })

        it("should return all widgets in a page when joining a page's room", (t, done) => {
            const socket = utils.websocketConnect(server, 'widgets', tokens[0])
            socket.on('addedOrChanged', (data: IWidget[]) => {
                socket.disconnect()
                t.assert.notEqual(data.find(x => x._id === widgetIds[0]), undefined)
                t.assert.notEqual(data.find(x => x._id === widgetIds[1]), undefined)
                done()
            })
            socket.emit('join', pageId)
        })

        it('should return a record when a widget is added', (t, done) => {
            let first = true
            const type = 'histogram'
            const socket = utils.websocketConnect(server, 'widgets', tokens[0])

            socket.on('addedOrChanged', (data: IWidget[]) => {
                if (first === true) {
                    first = false
                    utils.createWidget(server, tokens[0], pageId, sourceId, type)
                } else {
                    socket.disconnect()
                    t.assert.equal(data[0].type, type)
                    done()
                }
            })
            socket.emit('join', pageId)
        })

        it('should return a record when a widget is updated', (t, done) => {
            let first = true
            const type = 'histogram'
            const socket = utils.websocketConnect(server, 'widgets', tokens[0])

            socket.on('addedOrChanged', (data: IWidget[]) => {
                if (first === true) {
                    first = false
                    utils.getWidget(server, tokens[0], widgetIds[0])
                    .then(widget => {
                        widget.type = type
                        return utils.updateWidget(server, tokens[0], widget)
                    })
                } else {
                    socket.disconnect()
                    t.assert.equal(data[0].type, type)
                    done()
                }
            })
            socket.emit('join', pageId)
        })
    })

    describe('removed channel', () => {
        it('should return the id of a deleted widget', (t, done) => {
            let widgetId: string
            let isFirst = true
            const socket = utils.websocketConnect(server, 'widgets', tokens[0])
            
            socket.on('removed', (ids: string[]) => {
                socket.disconnect()
                t.assert.equal(ids[0], widgetId)
                done()
            })
            socket.on('addedOrChanged', async() => {
                if (!isFirst) return
                isFirst = false
                widgetId = await utils.createWidget(server, tokens[0], pageId, sourceId, 'histogram')
                await utils.deleteWidget(server, tokens[0], widgetId, pageId, bookId)
            })
            socket.emit('join', pageId)
        })
    })
})
