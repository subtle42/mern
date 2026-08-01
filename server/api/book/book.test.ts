import { IBook } from './model'
import * as utils from '../../testUtils'
import {describe, before, after, it, beforeEach} from 'node:test'
import { FastifyInstance } from 'fastify'
import { MongoMemoryServer } from 'mongodb-memory-server'

describe('Book API', () => {
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

    describe('POST /api/books', () => {
        const testName = 'unitTest'

        it('should return an error if user is NOT logged in', async(t) => {
            const res = await server.inject()
                .post('/api/books')
                .body({ name: testName })
            t.assert.notEqual(res.statusCode, 200)
        })

        it('should create a new book', async(t) => {
            const res = await server.inject()
                .post('/api/books')
                .headers({authorization: tokens[0]})
                .body({ name: testName })
            t.assert.equal(res.statusCode, 200)
            const book = await utils.getBook(server, tokens[0], res.body)
            t.assert.equal(book.name, testName)
            t.assert.equal(book.owner, userIds[0])
        })
    })

    describe('PUT /api/books', () => {
        let bookId: string
        let myBook: IBook

        before(async() => {
            bookId = await utils.createBook(server, tokens[0], 'update book test')
        })

        beforeEach(async() => {
            myBook = await utils.getBook(server, tokens[0], bookId)
        })

        it('should return an error if user is NOT logged in', async(t) => {
            const res = await server.inject()
                .put('/api/books')
                .body(myBook)
            t.assert.equal(res.statusCode, 401)
        })

        it('should return an error if user is NOT owner or editor', async(t) => {
            t.assert.notEqual(myBook.owner, userIds[1])
            const newName = 'fawliejfwalef'
            myBook.name = newName

            const res = await server.inject()
                .put('/api/books')
                .headers({authorization: tokens[1]})
                .body(myBook)

            t.assert.notEqual(res.statusCode, 200)
            const book = await utils.getBook(server, tokens[0], myBook._id)
            t.assert.notEqual(book.name, newName)
        })

        it('should return a success if user is the owner', async(t) => {
            t.assert.equal(myBook.owner, userIds[0])
            const res = await server.inject()
                .put('/api/books')
                .headers({authorization: tokens[0]})
                .body(myBook)
            t.assert.equal(res.statusCode, 200)
        })

        it('should return a success if user is an editor', async(t) => {
            const newName = 'editor update'
            myBook.editors.push(userIds[1])

            const res = await server.inject()
                .put('/api/books')
                .headers({authorization: tokens[0]})
                .body(myBook)
            t.assert.equal(res.statusCode, 200)
            myBook.name = newName

            const res2 = await server.inject()
                .put('/api/books')
                .headers({authorization: tokens[1]})
                .body(myBook)
            t.assert.equal(res2.statusCode, 200)
            const serverBook = await utils.getBook(server, tokens[1], myBook._id)
            t.assert.equal(serverBook.name, newName)
        })

        it('should return an error if schema does NOT match', async(t) => {
            let tmp: any = myBook
            tmp.name = { bad: 'data' }
            const res = await server.inject()
                .put('/api/books')
                .headers({authorization: tokens[0]})
                .body(tmp)
            t.assert.notEqual(res.statusCode, 200)
        })

        it('should return an error if a user other than the owner tries to change the owner', async(t) => {
            t.assert.equal(myBook.owner, userIds[0])
            t.assert.notEqual(myBook.editors.includes(userIds[1]), false)
            myBook.owner = userIds[1]

            const res = await server.inject()
                .put('/api/books')
                .headers({authorization: tokens[1]})
                .body(myBook)
            t.assert.notEqual(res.statusCode, 200)
            const serverBook = await utils.getBook(server, tokens[0], myBook._id)
            t.assert.equal(serverBook.owner, userIds[0])
        })

        it('should return a success if the owner changes the owner field', async(t) => {
            t.assert.equal(myBook.owner, userIds[0])
            myBook.owner = userIds[1]
            const res = await server.inject()
                .put('/api/books')
                .headers({authorization: tokens[0]})
                .body(myBook)
            t.assert.equal(res.statusCode, 200)
        })
    })

    describe('DELETE /api/books', () => {
        it('should return an error if user is NOT logged in', async(t) => {
            const res = await server.inject()
                .delete(`/api/books/myBookID`)
            t.assert.notEqual(res.statusCode, 200)
        })

        it('should return and error if book does NOT exist', async(t) => {
            const res = await server.inject()
                .delete(`/api/books/myBookID`)
                .headers({authorization: tokens[0]})
            t.assert.notEqual(res.statusCode, 200)
        })

        it('should stop a delete if user is NOT the owner', async(t) => {
            const bookId = await utils.createBook(server, tokens[0], 'wejkwflkjw')
            const res = await server.inject()
                .delete(`/api/books/${bookId}`)
                .headers({authorization: tokens[1]})
            t.assert.notEqual(res.statusCode, 200)
            const serverBook = await utils.getBook(server, tokens[0], bookId)
            t.assert.notEqual(serverBook, undefined)
        })

        it('should return a success if user is the owner', async(t) => {
            const bookId = await utils.createBook(server, tokens[1], 'aewrgtfefe')
            const res = await server.inject()
                .delete(`/api/books/${bookId}`)
                .headers({authorization: tokens[1]})
            t.diagnostic(res.body)
            t.assert.equal(res.statusCode, 200)
        })
    })
})

describe('Book Socket', () => {
    let tokens: string[] = []
    let userIds: string[] = []
    let server: FastifyInstance
    let db: MongoMemoryServer

    before(async() => {
        ({ userIds, tokens, server, db } = await utils.testSetup())
    })

    after(async() => {
        await utils.testCleanup(server, db)
    })

    describe('authentication', () => {
        it('should return an error if no token is provided', (t, done) => {
            utils.websocketConnect(server, 'aaa')
            .catch(err => done())
        })
    })

    describe('onAddedOrChanged channel', () => {
        const socketOpts = {namespace: 'books', channel: 'addedOrChanged'}

        describe('initial response', () => {
            it('should send a list of all books that user owns', async(t) => {
                const book1 = await utils.createBook(server, tokens[0], 'user1')
                const book2 = await utils.createBook(server, tokens[1], 'user2')
                const socket = await utils.websocketConnect(server, tokens[0])
                const data = await utils.getWsMessage<IBook[]>(socket, socketOpts)
                t.assert.equal(data[0]._id, book1)
                t.assert.equal(data.length, 1)
                socket.terminate()
            })

            it('should send books that a user can edit', async(t) => {
                const bookId1 = await utils.createBook(server, tokens[1], 'book1')
                const bookId2 = await utils.createBook(server, tokens[1], 'book3')
                const socket = await utils.websocketConnect(server, tokens[0])
                const msg = await utils.getWsMessage<IBook[]>(socket, socketOpts)
                socket.terminate()

                t.assert.equal(msg.filter(d => d._id === bookId1).length, 0)
                const book = await utils.getBook(server, tokens[1], bookId1)
                book.editors.push(userIds[0])
                await utils.updateBook(server, tokens[1], book)

                const socket2 = await utils.websocketConnect(server, tokens[0])
                const msg2 = await utils.getWsMessage<IBook[]>(socket2, socketOpts)
                socket2.terminate()
                t.assert.equal(msg2.filter(d => d._id === bookId1).length, 1)
            })

    //         it('should send books that a user can view', (t, done) => {
    //             utils.createBook(server, tokens[1], 'book3')
    //             .then(bookId => {
    //                 return new Promise(resolve => {
    //                     // Book does not show up in response
    //                     let socket = utils.websocketConnect(server, 'books', tokens[0])
    //                     socket.on('addedOrChanged', (data: IBook[]) => {
    //                         socket.disconnect()
    //                         t.assert.equal(data.filter(d => d._id === bookId).length, 0)
    //                         resolve('')
    //                     })
    //                 })
    //                 .then(() => utils.getBook(server, tokens[1], bookId))
    //                 .then(book => {
    //                     book.viewers.push(userIds[0])
    //                     return utils.updateBook(server, tokens[1], book)
    //                 })
    //                 .then(() => bookId)
    //             })
    //             .then(canEditId => {
    //                 let socket = utils.websocketConnect(server, 'books', tokens[0])
    //                 socket.on('addedOrChanged', (data: IBook[]) => {
    //                     socket.disconnect()
    //                     t.assert.equal(data.filter(d => d._id === canEditId).length, 1)
    //                     done()
    //                 })
    //             })
    //         })
        })

    //     describe('secondary responses', () => {
    //         it('should send an item when it is added', (t, done) => {
    //             const socket = utils.websocketConnect(server, 'books', tokens[2])
    //             let isFirst = true
    //             let bookId;
    //             socket.on('addedOrChanged', (data: IBook[]) => {
    //                 if (isFirst) {
    //                     isFirst = false
    //                     t.assert.equal(data.length, 0)
    //                     utils.createBook(server, tokens[2], 'alwefjowie')
    //                     .then(res => bookId = res)
    //                 } else {
    //                     socket.disconnect()
    //                     t.assert.equal(data.length, 1)
    //                     t.assert.equal(data[0]._id, bookId)
    //                     done()
    //                 }
    //             })
    //         })

    //         it('should send an item when it is updated', (t, done) => {
    //             const socket = utils.websocketConnect(server, 'books', tokens[2])
    //             let isFirst = true
    //             let bookId
    //             const updatedName = 'waeiouweofiuwqioefu'
    //             socket.on('addedOrChanged', (data: IBook[]) => {
    //                 if (isFirst) {
    //                     isFirst = false
    //                     const myBook = data.find(x => x._id === bookId) as IBook
    //                     myBook.name = updatedName
    //                     utils.updateBook(server, tokens[2], myBook)
    //                 } else {
    //                     socket.disconnect()
    //                     t.assert.equal(data.find(x => x._id === bookId).name, updatedName)
    //                     done()
    //                 }
    //             })

    //             utils.createBook(server, tokens[2], 'woifjjw')
    //             .then(res => bookId =res)
    //         })

    //         it('should send an item if a user is added as an editor', (t, done) => {
    //             let secondSocket = utils.websocketConnect(server, 'books', tokens[1])
    //             let isFirst: boolean = true
    //             let bookId: string
    //             secondSocket.on('addedOrChanged', (data: IBook[]) => {
    //                 if (isFirst) {
    //                     isFirst = false
    //                     utils.createBook(server, tokens[0], 'toShareAsEditor')
    //                     .then(bookId => utils.getBook(server, tokens[0], bookId))
    //                     .then(book => {
    //                         bookId = book._id
    //                         book.editors.push(userIds[1])
    //                         return utils.updateBook(server, tokens[0], book)
    //                     })
    //                 } else {
    //                     secondSocket.disconnect();
    //                     t.assert.equal(data.length, 1)
    //                     t.assert.equal(data[0]._id, bookId)
    //                     done()
    //                 }
    //             })
    //         })

    //         it('should send an item if a user is added as a viewer', (t, done) => {
    //             let secondSocket = utils.websocketConnect(server, 'books', tokens[1])
    //             let isFirst: boolean = true
    //             let bookId: string
    //             secondSocket.on('addedOrChanged', (data: IBook[]) => {
    //                 if (isFirst) {
    //                     isFirst = false
    //                     utils.createBook(server, tokens[0], 'toShareAsViewer')
    //                     .then(bookId => utils.getBook(server, tokens[0], bookId))
    //                     .then(book => {
    //                         bookId = book._id
    //                         book.viewers.push(userIds[1])
    //                         return utils.updateBook(server, tokens[0], book)
    //                     })
    //                 } else {
    //                     secondSocket.disconnect()
    //                     t.assert.equal(data.length, 1)
    //                     t.assert.equal(data[0]._id, bookId)
    //                     done()
    //                 }
    //             })
    //         })

    //         it('should send an item if a book becomes public', (t, done) => {
    //             let secondSocket = utils.websocketConnect(server, 'books', tokens[1])
    //             let isFirst: boolean = true
    //             let bookId: string
    //             secondSocket.on('addedOrChanged', (data: IBook[]) => {
    //                 if (isFirst) {
    //                     isFirst = false
    //                     utils.createBook(server, tokens[0], 'toGoPublic')
    //                     .then(bookId => utils.getBook(server, tokens[0], bookId))
    //                     .then(book => {
    //                         bookId = book._id
    //                         book.isPublic = true
    //                         return utils.updateBook(server, tokens[0], book)
    //                     })
    //                 } else {
    //                     secondSocket.disconnect()
    //                     t.assert.equal(data.length, 1)
    //                     t.assert.equal(data[0]._id, bookId)
    //                     done()
    //                 }
    //             })
    //         })
    //     })
    })

    // describe('removed channel', () => {
    //     it('should send an id if an item is deleted', (t, done) => {
    //         const socket = utils.websocketConnect(server, 'books', tokens[1])
    //         let removedId: string
    //         socket.on('addedOrChanged', async() => {
    //             // Remove listener to avoid infinit loop
    //             socket.removeListener('addedOrChanged')
    //             // Done inside addOrChanged due to socket being slow
    //             removedId = await utils.createBook(server, tokens[1], 'toBeRemoved')
    //             await utils.deleteBook(server, tokens[1], removedId)
    //         })
    //         socket.on('removed', (data) => {
    //             socket.disconnect()
    //             t.assert.equal(data[0], removedId)
    //             done()
    //         })
    //     })

    //     it('should send an id to a user if they are an editor', (t, done) => {
    //         let socket = utils.websocketConnect(server, 'books', tokens[1])

    //         socket.on('removed', (data) => {
    //             socket.disconnect()
    //             t.assert.equal(data[0], bookId)
    //             done()
    //         })

    //         let isFirst = true
    //         let bookId
    //         socket.on('addedOrChanged', async(books: IBook[]) => {
    //             if (!isFirst) return
    //             isFirst = false
    //             bookId = await utils.createBook(server, tokens[0], 'toBeRemoved')
    //             const myBook = await utils.getBook(server, tokens[0], bookId)
    //             myBook.editors.push(userIds[1])
    //             await utils.updateBook(server, tokens[0], myBook)
    //             await utils.deleteBook(server, tokens[0], myBook._id)
    //         })
    //     })

    //     it('should send an id to a user if they are a viewer', (t, done) => {
    //         let socket = utils.websocketConnect(server, 'books', tokens[1])

    //         socket.on('removed', (data) => {
    //             socket.disconnect()
    //             t.assert.equal(data[0], bookId)
    //             done()
    //         })

    //         let isFirst = true
    //         let bookId
    //         socket.on('addedOrChanged', async(books: IBook[]) => {
    //             if (!isFirst) return
    //             isFirst = false
    //             bookId = await utils.createBook(server, tokens[0], 'toBeRemoved')
    //             const myBook = await utils.getBook(server, tokens[0], bookId)
    //             myBook.viewers.push(userIds[1])
    //             await utils.updateBook(server, tokens[0], myBook)
    //             await utils.deleteBook(server, tokens[0], myBook._id)
    //         })
    //     })

    //     it('should send an id if item is no longer public', (t, done) => {
    //         let socket = utils.websocketConnect(server, 'books', tokens[1])

    //         socket.on('removed', (data) => {
    //             socket.disconnect()
    //             t.assert.equal(data[0], bookId)
    //             done()
    //         })

    //         let isFirst = true
    //         let bookId
    //         socket.on('addedOrChanged', async(books: IBook[]) => {
    //             if (!isFirst) return
    //             isFirst = false
    //             bookId = await utils.createBook(server, tokens[0], 'toBeRemoved')
    //             const myBook = await utils.getBook(server, tokens[0], bookId)
    //             myBook.isPublic = true
    //             await utils.updateBook(server, tokens[0], myBook)
    //             await utils.deleteBook(server, tokens[0], myBook._id)
    //         })
    //     })
    // })
})
