import { IPage, IBook } from 'common/models'
import { after, before, beforeEach, describe, it } from 'node:test'
import * as utils from '../../testUtils'
import { FastifyInstance } from 'fastify'
import { MongoMemoryServer } from 'mongodb-memory-server'

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

    before(async() => {
        ({server, db, userIds, tokens} = await utils.testSetup())
    })

    after(async() => {
        await utils.testCleanup(server, db)
    })

    describe('athorization', () => {
        let bookId: string
        let book: IBook
        before(async() => {
            bookId = await utils.createBook(server, tokens[0], 'authbook')
        })

        beforeEach(async() => {
            book = await utils.getBook(server, tokens[0], bookId)
        })

        it('should NOT let you join a room if you do NOT have access to the parent book', (t, done) => {
            const socket = utils.websocketConnect(server, 'pages', tokens[1])
            socket.emit('join', bookId)
            socket.on('message', (data: string) => {
                socket.disconnect()
                t.assert.equal(data.includes(bookId), true)
                done()
            })
        })

        it.todo('should return records if user is the owner of the book', (t, done) => {
            t.assert.equal(userIds[0], book.owner)

            const socket = utils.websocketConnect(server, 'pages', tokens[0])
            socket.emit('join', bookId)
            socket.on('addedOrChanged', data => {
                socket.disconnect()
                done()
            })
        })

        it.todo('should return records if user has edit access to the book', (t, done) => {
            book.editors.push(userIds[1])

            utils.updateBook(server, tokens[0], book)
            .then(() => {
                const socket = utils.websocketConnect(server, 'pages', tokens[1])
                socket.emit('join', bookId)
                socket.on('addedOrChanged', data => {
                    socket.disconnect()
                    done()
                })
            })
        })

        it.todo('should return records if user has viewer access to the book', (t, done) => {
            book.editors = []
            book.viewers.push(userIds[1])

            utils.updateBook(server, tokens[0], book)
            .then(() => {
                const socket = utils.websocketConnect(server, 'pages', tokens[1])
                socket.emit('join', bookId)
                socket.on('addedOrChanged', data => {
                    socket.disconnect()
                    done()
                })
            })
        })

        it.todo('should return records if book is public', (t, done) => {
            t.assert.notEqual(book.owner, userIds[2])
            t.assert.equal(book.editors.indexOf(userIds[2]), -1)
            t.assert.equal(book.viewers.indexOf(userIds[2]), -1)
            book.isPublic = true

            utils.updateBook(server, tokens[0], book)
            .then(() => {
                const socket = utils.websocketConnect(server, 'pages', tokens[2])
                socket.emit('join', bookId)
                socket.on('addedOrChanged', data => {
                    socket.disconnect()
                    done()
                })
            })
        })

        it.todo('should return an error if user tried to join a room that does not exist', (t, done) => {
            const socket = utils.websocketConnect(server, 'pages', tokens[2])
            socket.emit('join', 'badid')
            socket.on('message', data => {
                socket.disconnect()
                done()
            })
        })
    })

//     describe('addedOrChanged channel', () => {
//         let bookId: string

//         before(() => {
//             return utils.createBook(tokens[0], 'kwuheiwnecuiawe')
//             .then(id => bookId = id)
//         })

//         it("should return all pages in a book when joining a book's room", done => {
//             utils.createPage(tokens[0], bookId, 'jvoairjr')
//             .then(pageId => {
//                 const socket = utils.websocketConnect('pages', tokens[0])
//                 socket.emit('join', bookId)
//                 socket.on('addedOrChanged', (data: IPage[]) => {
//                     socket.disconnect()
//                     expect(data.filter(x => x._id === pageId).length).to.be.greaterThan(0)
//                     done()
//                 })
//             })
//         })

//         it('should return a record when a page is added', done => {
//             const pageName: string = 'awleoivjwerwerv'
//             let isFirst: boolean = true
//             const socket = utils.websocketConnect('pages', tokens[0])
//             socket.emit('join', bookId)
//             socket.on('addedOrChanged', (data: IPage[]) => {
//                 if (isFirst) {
//                     isFirst = false
//                     utils.createPage(tokens[0], bookId, pageName)
//                 } else {
//                     socket.disconnect()
//                     expect(data[0].name).to.equal(pageName)
//                     done()
//                 }
//             })
//         })

//         it('should return a record when a page is updated', done => {
//             const updateName: string = 'im different'
//             let isFirst: boolean = true

//             utils.getPages(tokens[0], bookId)
//             .then(pages => pages[0])
//             .then(page => {
//                 expect(page.name).not.to.equal(updateName)
//                 page.name = updateName

//                 const socket = utils.websocketConnect('pages', tokens[0])
//                 socket.emit('join', bookId)
//                 socket.on('addedOrChanged', (data: IPage[]) => {
//                     if (isFirst) {
//                         isFirst = false
//                         utils.updatePage(tokens[0], page)
//                     } else {
//                         socket.disconnect()
//                         expect(data[0].name).to.equal(updateName)
//                         done()
//                     }
//                 })
//             })
//         })
//     })

//     describe('removed channel', () => {
//         let bookId: string

//         before(done => {
//             utils.createBook(tokens[0], 'aweaowijecaec')
//             .then(id => bookId = id)
//             .then(() => done())
//         })

//         it('should return the id of a deleted page', done => {
//             let pageId: string

//             const socket = utils.websocketConnect('pages', tokens[0])
//             socket.emit('join', bookId)
//             socket.on('removed', (data: string) => {
//                 socket.disconnect()
//                 expect(data[0]).to.equal(pageId)
//                 done()
//             })

//             utils.createPage(tokens[0], bookId, 'myPage')
//             .then(id => pageId = id)
//             .then(() => utils.deletePage(tokens[0], pageId))
//         })
//     })
})
