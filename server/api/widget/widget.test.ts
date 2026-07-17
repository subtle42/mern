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

// describe('Widget Channel', () => {
//     let bookId: string
//     let tokens: string[]
//     let userIds: string[]
//     let pageId: string
//     let sourceId: string

//     before(() => {
//         return utils.testSetup()
//         .then(setup => ({ userIds, tokens } = setup))
//         .then(() => utils.createBook(tokens[0], 'top book'))
//         .then(id => bookId = id)
//         .then(() => utils.createPage(tokens[0], bookId, 'top page'))
//         .then(id => pageId = id)
//         .then(() => utils.createSource(tokens[0], path.join(__dirname, 'data/2012_SAT_RESULTS.csv')))
//         .then(id => sourceId = id)
//     })

//     after(() => {
//         return utils.cleanDb()
//     })

//     describe('authorization', () => {
//         it('should NOT let you join a room if user does NOT have access to the parent book', done => {
//             let socket: SocketIOClient.Socket = utils.websocketConnect('widgets', tokens[2])
//             socket.on('message', data => {
//                 socket.disconnect()
//                 done()
//             })

//             socket.emit('join', pageId)
//         })

//         it('should return records if user is the owner of the book', done => {
//             let socket: SocketIOClient.Socket = utils.websocketConnect('widgets', tokens[0])
//             socket.on('addedOrChanged', data => {
//                 socket.disconnect()
//                 expect(data).not.to.equal(undefined)
//                 done()
//             })

//             socket.emit('join', pageId)
//         })

//         it('should return recores if user has edit access to the book', done => {
//             let socket: SocketIOClient.Socket

//             utils.getBook(tokens[0], bookId)
//             .then(book => {
//                 book.editors.push(userIds[1])
//                 return utils.updateBook(tokens[0], book)
//             })
//             .then(() => {
//                 socket = utils.websocketConnect('widgets', tokens[1])
//                 socket.on('addedOrChanged', data => {
//                     socket.disconnect()
//                     expect(data).not.to.equal(undefined)
//                     done()
//                 })

//                 socket.emit('join', pageId)
//             })
//         })

//         it('should return records if user has viewer access to the book', done => {
//             let socket: SocketIOClient.Socket

//             utils.getBook(tokens[0], bookId)
//             .then(book => {
//                 book.viewers.push(userIds[2])
//                 return utils.updateBook(tokens[0], book)
//             })
//             .then(() => {
//                 socket = utils.websocketConnect('widgets', tokens[2])
//                 socket.on('addedOrChanged', data => {
//                     socket.disconnect()
//                     expect(data).not.to.equal(undefined)
//                     done()
//                 })

//                 socket.emit('join', pageId)
//             })
//         })

//         it('should return records if book is public', done => {
//             let socket: SocketIOClient.Socket

//             utils.getBook(tokens[0], bookId)
//             .then(book => {
//                 book.editors = []
//                 book.viewers = []
//                 book.isPublic = true
//                 return utils.updateBook(tokens[0], book)
//             })
//             .then(() => {
//                 socket = utils.websocketConnect('widgets', tokens[2])
//                 socket.on('addedOrChanged', data => {
//                     socket.disconnect()
//                     expect(data).not.to.equal(undefined)
//                     done()
//                 })

//                 socket.emit('join', pageId)
//             })
//         })

//         it('should return an error if user tries to join a room that does not exist', done => {
//             let socket: SocketIOClient.Socket = utils.websocketConnect('widgets', tokens[2])

//             socket.on('message', data => {
//                 socket.disconnect()
//                 expect(data).not.to.equal(undefined)
//                 done()
//             })

//             socket.emit('join', 'badId')
//         })
//     })

//     describe('addedOrChanged channel', () => {
//         let widgetIds: string[]

//         before(() => {
//             return Promise.all([
//                 utils.createWidget(tokens[0], pageId, sourceId, 'histogram'),
//                 utils.createWidget(tokens[0], pageId, sourceId, 'histogram')
//             ])
//             .then(ids => widgetIds = ids)
//         })

//         it("should return all widgets in a page when joining a page's room", done => {
//             let socket: SocketIOClient.Socket = utils.websocketConnect('widgets', tokens[0])
//             socket.on('addedOrChanged', (data: IWidget[]) => {
//                 socket.disconnect()
//                 expect(data.filter(x => x._id === widgetIds[0]).length).to.equal(1)
//                 expect(data.filter(x => x._id === widgetIds[1]).length).to.equal(1)
//                 done()
//             })

//             socket.emit('join', pageId)
//         })

//         it('should return a record when a widget is added', done => {
//             let first: boolean = true
//             let type: string = 'histogram'
//             let socket: SocketIOClient.Socket = utils.websocketConnect('widgets', tokens[0])

//             socket.on('addedOrChanged', (data: IWidget[]) => {
//                 if (first === true) {
//                     first = false
//                     utils.createWidget(tokens[0], pageId, sourceId, type)
//                 } else {
//                     socket.disconnect()
//                     expect(data[0].type).to.equal(type)
//                     done()
//                 }
//             })

//             socket.emit('join', pageId)
//         })

//         it('should return a record when a widget is updated', done => {
//             let first: boolean = true
//             let type: string = 'histogram'
//             let socket: SocketIOClient.Socket = utils.websocketConnect('widgets', tokens[0])

//             socket.on('addedOrChanged', (data: IWidget[]) => {
//                 if (first === true) {
//                     first = false
//                     utils.getWidget(tokens[0], widgetIds[0])
//                     .then(widget => {
//                         widget.type = type
//                         return utils.updateWidget(tokens[0], widget)
//                     })
//                 } else {
//                     socket.disconnect()
//                     expect(data[0].type).to.equal(type)
//                     done()
//                 }
//             })

//             socket.emit('join', pageId)
//         })
//     })

//     describe('removed channel', () => {
//         it('should return the id of a deleted widget', done => {
//             let widgetId: string
//             let socket: SocketIOClient.Socket = utils.websocketConnect('widgets', tokens[0])
//             socket.on('removed', (ids: string[]) => {
//                 socket.disconnect()
//                 expect(ids[0]).to.equal(widgetId)
//                 done()
//             })
//             socket.emit('join', pageId)

//             utils.createWidget(tokens[0], pageId, sourceId, 'histogram')
//             .then(id => widgetId = id)
//             .then(() => utils.deleteWidget(tokens[0], widgetId, pageId, bookId))
//         })
//     })
// })
