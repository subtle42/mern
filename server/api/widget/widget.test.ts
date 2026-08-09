import {describe, before, after, it, beforeEach} from 'node:test'
import { FastifyInstance } from 'fastify'
import { IWidget } from './model'
import { IBook } from '../book/model'
import { TestEnv, testSetup } from 'server/testUtils'

describe('Widget API', () => {
    let tokens: string[]
    let userIds: string[]
    let server: FastifyInstance
    let bookId: string
    let pageId: string
    let sourceId: string
    let utils: TestEnv

    before(async() => {
        ({server, utils, userIds, tokens} = await testSetup())

        bookId = await utils.book.create(tokens[0], 'top book')
        pageId = await utils.page.create(tokens[0], bookId, 'top page')
        sourceId = await utils.source.create(tokens[0], '../integration/data/2012_SAT_RESULTS.csv')
    })

    after(async() => {
        await utils.cleanup()
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
            const myBook = await utils.book.get(tokens[0], bookId)
            myBook.editors.push(userIds[1])
            await utils.book.update(tokens[0], myBook)

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
            widgetId = await utils.widget.create(tokens[0], pageId, sourceId, 'histogram')
        })

        beforeEach(async() => {
            widget = await utils.widget.get(tokens[0], widgetId)
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
            const data = await utils.widget.get(tokens[0], widgetId)
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
            const data = await utils.widget.get(tokens[0], widgetId)
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
            const data = await utils.widget.get(tokens[0], widgetId)
            t.assert.equal(data.dimensions.filter(x => x === test).length, 1)
        })
    })

    describe('DELETE /api/widgets', () => {
        let book: IBook
        before(async() => {
            book = await utils.book.get(tokens[0], bookId)
        })

        it('should return an error if user is NOT logged in', async(t) => {
            const res = await server.inject()
                .delete(`/api/widgets/asdf/${pageId}/${bookId}`)
            t.assert.equal(res.statusCode, 401)
        })

        it('should return an error if user does NOT have edit access', async(t) => {
            t.assert.notEqual(book.owner, userIds[2])
            t.assert.equal(book.editors.includes(userIds[2]), false)

            const widgetId = await utils.widget.create(tokens[0], pageId, sourceId, 'histogram')
            const res = await server.inject()
                .delete(`/api/widgets/${widgetId}/${pageId}/${bookId}`)
                .headers({authorization: tokens[2]})
            t.assert.notEqual(res.statusCode, 200)
            const data = await utils.widget.get(tokens[0], widgetId)
            t.assert.equal(data._id, widgetId)
        })

        it('should return a success if the user has owner access', async(t) => {
            t.assert.equal(book.owner, userIds[0])
            const widgetId = await utils.widget.create(tokens[0], pageId, sourceId, 'histogram')
            const res = await server.inject()
                .delete(`/api/widgets/${widgetId}/${pageId}/${bookId}`)
                .headers({authorization: tokens[0]})
            t.assert.equal(res.statusCode, 200)
            const data: any = await utils.widget.get(tokens[0], widgetId)
            t.assert.notEqual(data.statusCode, 200)
        })

        it('should return a success if the user has edit access', async(t) => {
            t.assert.equal(book.editors.includes(userIds[1]), true)
            const widgetId = await utils.widget.create(tokens[0], pageId, sourceId, 'histogram')
            const res = await server.inject()
                .delete(`/api/widgets/${widgetId}/${pageId}/${bookId}`)
                .headers({authorization: tokens[1]})
            t.assert.equal(res.statusCode, 200)
            const data: any = await utils.widget.get(tokens[0], widgetId)
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
    let utils: TestEnv
    const myNamespace = 'widgets'

    before(async() => {
        ({server, utils, userIds, tokens} = await testSetup())

        bookId = await utils.book.create(tokens[0], 'top book')
        pageId = await utils.page.create(tokens[0], bookId, 'top page')
        sourceId = await utils.source.create(tokens[0], '../integration/data/2012_SAT_RESULTS.csv')
        await utils.widget.create(tokens[0], pageId, sourceId, 'histogram')
    })

    after(() => {
        return utils.cleanup()
    })

    describe('authorization', () => {
        it('should NOT let you join a room if user does NOT have access to the parent book', async(t) => {
            const socket = await utils.websocketConnect(tokens[2])
            let bookResolve;
            const bookCall = new Promise<IBook[]>(r => { bookResolve = r })
            let errResolve;
            const errCall = new Promise<string>(r => { errResolve = r })

            socket.on('message', ev => {
                const {channel, namespace, data, error} = JSON.parse(ev.toString())
                if (error) return errResolve(error)
                if (channel !== 'addedOrChanged') return
                if (namespace === 'books') return bookResolve(data)
            })
            await bookCall
            socket.send(JSON.stringify({
                namespace: myNamespace, channel: 'join', room: pageId
            }))
            const data = await errCall
            t.assert.notEqual(data, undefined)
            socket.terminate()
        })

        it('should return records if user is the owner of the book', async(t) => {
            const socket = await utils.websocketConnect(tokens[0])
            let bookResolve;
            const bookCall = new Promise<IBook[]>(r => { bookResolve = r })
            let widgetResolve;
            const widgetCall = new Promise<IWidget[]>(r => { widgetResolve = r })

            socket.on('message', ev => {
                const {channel, namespace, data, error} = JSON.parse(ev.toString())
                if (channel !== 'addedOrChanged') return
                if (namespace === 'books') return bookResolve(data)
                if (namespace === myNamespace) return widgetResolve(data)
            })
            await bookCall
            socket.send(JSON.stringify({
                namespace: myNamespace, channel: 'join', room: pageId
            }))
            const data = await widgetCall
            t.assert.equal(data.length > 0, true)
            socket.terminate()
        })

        it('should return records if user has edit access to the book', async(t) => {
            let bookResolve;
            const bookCall = new Promise<IBook[]>(r => { bookResolve = r })
            let widgetResolve;
            const widgetCall = new Promise<IWidget[]>(r => { widgetResolve = r })
            const book = await utils.book.get(tokens[0], bookId)
            book.editors.push(userIds[1])
            book.viewers = []
            book.isPublic = false
            await utils.book.update(tokens[0], book)
            
            const socket = await utils.websocketConnect(tokens[1])
            socket.on('message', ev => {
                const {channel, namespace, data, error} = JSON.parse(ev.toString())
                if (channel !== 'addedOrChanged') return
                if (namespace === 'books') return bookResolve(data)
                if (namespace === myNamespace) return widgetResolve(data)
            })

            await bookCall
            socket.send(JSON.stringify({
                namespace: myNamespace, channel: 'join', room: pageId
            }))
            const data = await widgetCall
            t.assert.notEqual(data.find(w => w.pageId === pageId), undefined)
            socket.terminate()
        })

        it('should return records if user has viewer access to the book', async(t) => {
            let bookResolve;
            const bookCall = new Promise<IBook[]>(r => { bookResolve = r })
            let widgetResolve;
            const widgetCall = new Promise<IWidget[]>(r => { widgetResolve = r })
            const book = await utils.book.get(tokens[0], bookId)
            book.editors = []
            book.viewers = [userIds[2]]
            book.isPublic = false
            await utils.book.update(tokens[0], book)
            
            const socket = await utils.websocketConnect(tokens[2])
            socket.on('message', ev => {
                const {channel, namespace, data, error} = JSON.parse(ev.toString())
                if (channel !== 'addedOrChanged') return
                if (namespace === 'books') return bookResolve(data)
                if (namespace === myNamespace) return widgetResolve(data)
            })

            await bookCall
            socket.send(JSON.stringify({
                namespace: myNamespace, channel: 'join', room: pageId
            }))
            const data = await widgetCall
            t.assert.notEqual(data.find(w => w.pageId === pageId), undefined)
            socket.terminate()
        })

        it('should return records if book is public', async(t) => {
            let bookResolve;
            const bookCall = new Promise<IBook[]>(r => { bookResolve = r })
            let widgetResolve;
            const widgetCall = new Promise<IWidget[]>(r => { widgetResolve = r })
            const book = await utils.book.get(tokens[0], bookId)
            book.editors = []
            book.viewers = []
            book.isPublic = true
            await utils.book.update(tokens[0], book)
            
            const socket = await utils.websocketConnect(tokens[2])
            socket.on('message', ev => {
                const {channel, namespace, data, error} = JSON.parse(ev.toString())
                if (channel !== 'addedOrChanged') return
                if (namespace === 'books') return bookResolve(data)
                if (namespace === myNamespace) return widgetResolve(data)
            })
            await bookCall
            socket.send(JSON.stringify({
                namespace: myNamespace, channel: 'join', room: pageId
            }))
            const data = await widgetCall
            t.assert.notEqual(data.find(w => w.pageId === pageId), undefined)
            socket.terminate()
        })

        it('should return an error if user tries to join a room that does not exist', async(t) => {
            let bookResolve;
            const bookCall = new Promise<IBook[]>(r => { bookResolve = r })
            let widgetResolve;
            const widgetCall = new Promise<string>(r => { widgetResolve = r })

            const socket = await utils.websocketConnect(tokens[2])

            socket.on('message', ev => {
                const {channel, namespace, data, error} = JSON.parse(ev.toString())
                if (error) return widgetResolve(error)
                if (channel !== 'addedOrChanged') return
                if (namespace === 'books') return bookResolve(data)
            })
            await bookCall
            socket.send(JSON.stringify({
                namespace: myNamespace, channel: 'join', room: 'badid'
            }))
            const data = await widgetCall
            t.assert.equal(data.length > 0, true)
            socket.terminate()
        })
    })

    describe('addedOrChanged channel', () => {
        const widgetIds: string[] = []

        before(async() => {
            const id1 = await utils.widget.create(tokens[0], pageId, sourceId, 'histogram')
            const id2 = await utils.widget.create(tokens[0], pageId, sourceId, 'histogram')
            widgetIds.push(id1, id2)
        })

        it("should return all widgets in a page when joining a page's room", async(t) => {
            const socket = await utils.websocketConnect(tokens[0])
            let bookResolve;
            const bookCall = new Promise<IBook[]>(r => { bookResolve = r })
            let widgetResolve;
            const widgetCall = new Promise<IWidget[]>(r => { widgetResolve = r })

            socket.on('message', ev => {
                const {channel, namespace, data, error} = JSON.parse(ev.toString())
                if (channel !== 'addedOrChanged') return
                if (namespace === myNamespace) return widgetResolve(data)
                if (namespace === 'books') return bookResolve(data)
            })
            await bookCall
            socket.send(JSON.stringify({
                namespace: myNamespace, channel: 'join', room: pageId
            }))
            const data = await widgetCall
            t.assert.notEqual(data.find(x => x._id === widgetIds[0]), undefined)
            t.assert.notEqual(data.find(x => x._id === widgetIds[1]), undefined)
            socket.terminate()
        })

        it('should return a record when a widget is added', async(t) => {
            let first = true
            const socket = await utils.websocketConnect(tokens[0])
            let bookResolve;
            const bookCall = new Promise<IBook[]>(r => { bookResolve = r })
            let widgetResolve;
            const widgetCall = new Promise<IWidget[]>(r => { widgetResolve = r })
            let secondResolve;
            const secondCall = new Promise<IWidget[]>(r => { secondResolve = r })

            socket.on('message', ev => {
                const {channel, namespace, data, error} = JSON.parse(ev.toString())
                if (channel !== 'addedOrChanged') return
                if (namespace === 'books') return bookResolve(data)
                if (namespace === 'sources') return
                first ? widgetResolve(data) : secondResolve(data)
                first = false
            })
            await bookCall
            socket.send(JSON.stringify({
                namespace: myNamespace, channel: 'join', room: pageId
            }))
            await widgetCall
            const wId = await utils.widget.create(tokens[0], pageId, sourceId, 'histogram')
            const data = await secondCall
            t.assert.notEqual(data.find(x => x._id === wId), undefined)
            socket.terminate()
        })

        it('should return a record when a widget is updated', async(t) => {
            let first = true
            const socket = await utils.websocketConnect(tokens[0])
            let bookResolve;
            const bookCall = new Promise<IBook[]>(r => { bookResolve = r })
            let widgetResolve;
            const widgetCall = new Promise<IWidget[]>(r => { widgetResolve = r })
            let secondResolve;
            const secondCall = new Promise<IWidget[]>(r => { secondResolve = r })

            socket.on('message', ev => {
                const {channel, namespace, data, error} = JSON.parse(ev.toString())
                if (channel !== 'addedOrChanged') return
                if (namespace === 'books') return bookResolve(data)
                if (namespace === 'sources') return
                first ? widgetResolve(data) : secondResolve(data)
                first = false
            })
            await bookCall
            socket.send(JSON.stringify({
                namespace: myNamespace, channel: 'join', room: pageId
            }))
            await widgetCall
            const myWidget = await utils.widget.get(tokens[0], widgetIds[0])
            myWidget.type = 'histogram'
            await utils.widget.update(tokens[0], myWidget)
            const data = await secondCall
            t.assert.equal(data[0]._id, widgetIds[0])
            t.assert.equal(data[0].type, 'histogram')
            socket.terminate()
        })
    })

    describe('removed channel', () => {
        it('should return the id of a deleted widget', async(t) => {
            let widgetId: string
            const socket = await utils.websocketConnect(tokens[0])
            let bookResolve;
            const bookCall = new Promise<IBook[]>(r => { bookResolve = r })
            let widgetResolve;
            const widgetCall = new Promise<IWidget[]>(r => { widgetResolve = r })
            let removedResolve;
            const removedCall = new Promise<IWidget[]>(r => { removedResolve = r })


            socket.on('message', ev => {
                const {channel, namespace, data, error} = JSON.parse(ev.toString())
                if (channel === 'removed' && namespace === myNamespace) return removedResolve(data)
                if (channel === 'addedOrChanged' && namespace === 'books') return bookResolve(data)
                if (channel === 'addedOrChanged' && namespace === myNamespace) return widgetResolve(data)
            })
            await bookCall
            socket.send(JSON.stringify({
                namespace: myNamespace, channel: 'join', room: pageId
            }))
            await widgetCall
            widgetId = await utils.widget.create(tokens[0], pageId, sourceId, 'histogram')
            await utils.widget.remove(tokens[0], widgetId, pageId, bookId)
            const data = await removedCall
            t.assert.equal(data[0], widgetId)
            socket.terminate()
        })
    })
})
