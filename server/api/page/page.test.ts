import { after, before, beforeEach, describe, it } from 'node:test'
import * as utils from '../../testUtils'
import { FastifyInstance } from 'fastify'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { IBook } from '../book/model'
import { IPage } from './model'

describe('Page API', () => {
    let bookId: string
    let tokens: string[]
    let userIds: string[]
    let server: FastifyInstance
    let db: MongoMemoryServer

    before(async() => {
        ({server, db, userIds, tokens} = await utils.testSetup())
        bookId = await utils.createBook(server, tokens[0], 'myBook')
    })

    after(async() => {
        await utils.testCleanup(server, db)
    })

    describe('POST /api/pages', () => {
        let myBook: IBook
        beforeEach(async() => {
            myBook = await utils.getBook(server, tokens[0], bookId)
        })

        it('should return an error if the user does not have edit access', async(t) => {
            t.assert.equal(myBook.editors.indexOf(userIds[1]), -1)
            const res = await server.inject()
                .post('/api/pages')
                .headers({authorization: tokens[1]})
                .body({
                    name: 'afwehjlkw',
                    bookId: bookId
                })
            t.assert.notEqual(res.statusCode, 200)
        })

        it('should return a success if user has owner access to the book', async(t) => {
            const res = await server.inject()
                .post('/api/pages')
                .headers({authorization: tokens[0]})
                .body({
                    name: 'afwehjlkw',
                    bookId: bookId
                })
            t.assert.equal(res.statusCode, 200)
        })

        it('should return a success if user has edit access', async(t) => {
            myBook.editors.push(userIds[1])
            await utils.updateBook(server, tokens[0], myBook)
            const res = await server.inject()
                .post('/api/pages')
                .headers({authorization: tokens[0]})
                .body({
                    name: 'editor page',
                    bookId: bookId
                })
            t.assert.equal(res.statusCode, 200)
        })

        it('should return an error if user is NOT logged in', async(t) => {
            const res = await server.inject()
                .post('/api/pages')
                .body({
                    name: 'afwehjlkw',
                    bookId: bookId
                })
            t.assert.notEqual(res.statusCode, 200)
        })
    })

    describe('PUT /api/pages', () => {
        let myBook: IBook
        let myPages: IPage[]

        beforeEach(async() => {
            myBook = await utils.getBook(server, tokens[0], bookId)
            myPages = await utils.getPages(server, tokens[0], bookId)
        })

        it('should return an error if user is NOT logged in', async(t) => {
            const res = await server.inject()
                .put('/api/pages')
                .body({})
            t.assert.notEqual(res.statusCode, 200)
        })

        it('should return a success if user is the owner of the parent book', async(t) => {
            const myPage = myPages[0]
            t.assert.equal(myBook._id, myPage.bookId)
            t.assert.equal(myBook.owner, userIds[0])

            const res = await server.inject()
                .put('/api/pages')
                .headers({authorization: tokens[0]})
                .body(myPage)
            t.assert.equal(res.statusCode, 200)
        })

        it('should return a success if user is an editor of the parent book', async(t) => {
            const myPage = myPages[0]
            t.assert.notEqual(myPage, undefined)

            const userId = utils.getUserIdFromToken(server, [tokens[1]])[0]
            myBook.editors.push(userId)
            await utils.updateBook(server, tokens[0], myBook)
            const res = await server.inject()
                .put('/api/pages')
                .headers({authorization: tokens[1]})
                .body(myPage)
            t.assert.equal(res.statusCode, 200)
        })

        it('should return a failure if user NOT an owner or an editor', async(t) => {
            const myPage = myPages[0]
            t.assert.notEqual(myPage, undefined)

            const res = await server.inject()
                .put('/api/pages')
                .headers({authorization: tokens[2]})
                .body(myPage)
            t.assert.notEqual(res.statusCode, 200)
        })

        it('should return a failure if schema does not match', async(t) => {
            const myPage = myPages[0]
            t.assert.notEqual(myPage, undefined)
            myPage.name = { badData: 'awekfjwef' } as any

            const res = await server.inject()
                .put('/api/pages')
                .headers({authorization: tokens[0]})
                .body(myPage)
            t.assert.notEqual(res.statusCode, 200)
        })
    })

    describe('DELETE /api/pages', () => {
        let myBook: IBook
        let myPages: IPage[]

        beforeEach(async() => {
            myBook = await utils.getBook(server, tokens[0], bookId)
            myPages = await utils.getPages(server, tokens[0], bookId)
        })

        it('should return a failure if user is not logged in', async(t) => {
            const res = await server.inject()
                .delete('/api/pages/myID')
            t.assert.equal(res.statusCode, 401)
        })

        it('should return an error if page does NOT exist', async(t) => {
            t.assert.equal(myBook.owner, userIds[0])

            const res = await server.inject()
                .delete('/api/pages/badId')
                .headers({authorization: tokens[0]})
            t.assert.notEqual(res.statusCode, 200)
        })

        it('should return a success if the user is the owner of the parent book', async(t) => {
            const pageId = await utils.createPage(server, tokens[0], bookId, 'to remove')
            const res = await server.inject()
                .delete(`/api/pages/${pageId}`)
                .headers({authorization: tokens[0]})
            t.assert.equal(res.statusCode, 200)
            const pages = await utils.getPages(server, tokens[0], bookId)
            t.assert.equal(pages.find(p => p._id === pageId), undefined)
        })

        it('should return a success if the user is an editor of the parent book', async(t) => {
            t.assert.equal(myBook.editors.includes(userIds[1]), true)
            const pageId = await utils.createPage(server, tokens[0], bookId, 'editor remove')
            const res = await server.inject()
                .delete(`/api/pages/${pageId}`)
                .headers({authorization: tokens[1]})
            t.assert.equal(res.statusCode, 200)
            const pages = await utils.getPages(server, tokens[0], bookId)
            t.assert.equal(pages.find(p => p._id === pageId), undefined)
        })
    })
})

describe('Page Socket', () => {
    let tokens: string[]
    let userIds: string[]
    let server: FastifyInstance
    let db: MongoMemoryServer
    const myNamespace = 'pages'

    before(async() => {
        ({server, db, userIds, tokens} = await utils.testSetup())
    })

    after(async() => {
        await utils.testCleanup(server, db)
    })

    describe('athorization', () => {
        let bookId: string
        let pageId: string
        let page: IPage[]
        let book: IBook
        before(async() => {
            bookId = await utils.createBook(server, tokens[0], 'authbook')
            pageId = await utils.createPage(server, tokens[0], bookId, 'authpage')
        })

        beforeEach(async() => {
            book = await utils.getBook(server, tokens[0], bookId)
            page = await utils.getPages(server, tokens[0], bookId)
        })

        it('should NOT let you join a room if you do NOT have access to the parent book', async(t) => {
            const socket = await utils.websocketConnect(server, tokens[1])
            let bookResolve;
            const bookCall = new Promise<IPage[]>(r => { bookResolve = r })
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
                namespace: myNamespace, channel: 'join', room: bookId
            }))
            const data = await errCall
            t.assert.notEqual(data, undefined)
            socket.terminate()
        })

        it('should return records if user is the owner of the book', async(t) => {
            const socket = await utils.websocketConnect(server, tokens[0])
            let bookResolve;
            const bookCall = new Promise<IPage[]>(r => { bookResolve = r })
            let pageResolve;
            const pageCall = new Promise<string>(r => { pageResolve = r })

            socket.on('message', ev => {
                const {channel, namespace, data} = JSON.parse(ev.toString())
                if (channel !== 'addedOrChanged') return
                if (namespace === 'books') return bookResolve(data)
                if (namespace === myNamespace) return pageResolve(data)
            })
            await bookCall
            socket.send(JSON.stringify({
                namespace: myNamespace, channel: 'join', room: bookId
            }))
            const data = await pageCall
            t.assert.equal(data.length > 0, true)
            socket.terminate()
        })

        // it.todo('should return records if user has edit access to the book', (t, done) => {
        //     book.editors.push(userIds[1])

        //     utils.updateBook(server, tokens[0], book)
        //     .then(() => {
        //         const socket = utils.websocketConnect(server, 'pages', tokens[1])
        //         socket.emit('join', bookId)
        //         socket.on('addedOrChanged', data => {
        //             socket.disconnect()
        //             done()
        //         })
        //     })
        // })

        // it.todo('should return records if user has viewer access to the book', (t, done) => {
        //     book.editors = []
        //     book.viewers.push(userIds[1])

        //     utils.updateBook(server, tokens[0], book)
        //     .then(() => {
        //         const socket = utils.websocketConnect(server, 'pages', tokens[1])
        //         socket.emit('join', bookId)
        //         socket.on('addedOrChanged', data => {
        //             socket.disconnect()
        //             done()
        //         })
        //     })
        // })

        // it.todo('should return records if book is public', (t, done) => {
        //     t.assert.notEqual(book.owner, userIds[2])
        //     t.assert.equal(book.editors.indexOf(userIds[2]), -1)
        //     t.assert.equal(book.viewers.indexOf(userIds[2]), -1)
        //     book.isPublic = true

        //     utils.updateBook(server, tokens[0], book)
        //     .then(() => {
        //         const socket = utils.websocketConnect(server, 'pages', tokens[2])
        //         socket.emit('join', bookId)
        //         socket.on('addedOrChanged', data => {
        //             socket.disconnect()
        //             done()
        //         })
        //     })
        // })

        // it.todo('should return an error if user tried to join a room that does not exist', (t, done) => {
        //     const socket = utils.websocketConnect(server, 'pages', tokens[2])
        //     socket.emit('join', 'badid')
        //     socket.on('message', data => {
        //         socket.disconnect()
        //         done()
        //     })
        // })
    })

    // describe('addedOrChanged channel', () => {
    //     let bookId: string

    //     before(() => {
    //         return utils.createBook(server, tokens[0], 'kwuheiwnecuiawe')
    //         .then(id => bookId = id)
    //     })

    //     it("should return all pages in a book when joining a book's room", (t, done) => {
    //         utils.createPage(server, tokens[0], bookId, 'jvoairjr')
    //         .then(pageId => {
    //             const socket = utils.websocketConnect(server, 'pages', tokens[0])
    //             socket.emit('join', bookId)
    //             socket.on('addedOrChanged', (data: IPage[]) => {
    //                 socket.disconnect()
    //                 t.assert.equal(data.filter(x => x._id === pageId).length > 0, true)
    //                 done()
    //             })
    //         })
    //     })

    //     it('should return a record when a page is added', (t, done) => {
    //         const pageName: string = 'awleoivjwerwerv'
    //         let isFirst: boolean = true
    //         const socket = utils.websocketConnect(server, 'pages', tokens[0])
    //         socket.emit('join', bookId)
    //         socket.on('addedOrChanged', (data: IPage[]) => {
    //             if (isFirst) {
    //                 isFirst = false
    //                 utils.createPage(server, tokens[0], bookId, pageName)
    //             } else {
    //                 socket.disconnect()
    //                 t.assert.equal(data[0].name, pageName)
    //                 done()
    //             }
    //         })
    //     })

    //     it('should return a record when a page is updated', (t, done) => {
    //         const updateName: string = 'im different'
    //         let isFirst: boolean = true

    //         utils.getPages(server, tokens[0], bookId)
    //         .then(pages => pages[0])
    //         .then(page => {
    //             t.assert.notEqual(page.name, updateName)
    //             page.name = updateName

    //             const socket = utils.websocketConnect(server, 'pages', tokens[0])
    //             socket.emit('join', bookId)
    //             socket.on('addedOrChanged', (data: IPage[]) => {
    //                 if (isFirst) {
    //                     isFirst = false
    //                     utils.updatePage(server, tokens[0], page)
    //                 } else {
    //                     socket.disconnect()
    //                     t.assert.equal(data[0].name, updateName)
    //                     done()
    //                 }
    //             })
    //         })
    //     })
    // })

    // describe('removed channel', () => {
    //     let bookId: string

    //     before(async() => {
    //         bookId = await utils.createBook(server, tokens[0], 'aweaowijecaec')
    //     })

    //     it('should return the id of a deleted page', (t, done) => {
    //         let pageId: string

    //         const socket = utils.websocketConnect(server, 'pages', tokens[0])
    //         socket.emit('join', bookId)
    //         socket.on('removed', (data: string) => {
    //             socket.disconnect()
    //             t.assert.equal(data[0], pageId)
    //             done()
    //         })
    //         let isFirst = true
    //         socket.on('addedOrChanged', () => {
    //             if (!isFirst) return
    //             isFirst = false
    //             utils.createPage(server, tokens[0], bookId, 'myPage')
    //             .then(id => pageId = id)
    //             .then(() => utils.deletePage(server, tokens[0], pageId))
    //         })
    //     })
    // })
})
