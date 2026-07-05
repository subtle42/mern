import { IBook } from 'common/models'
import * as utils from '../../testUtils'
import {describe, before, after, it, beforeEach} from 'node:test'
import { FastifyInstance } from 'fastify'
import { MongoMemoryServer } from 'mongodb-memory-server'
import * as io from 'socket.io-client'

describe('Book API', () => {
    let tokens: string[]
    // let nsp: io.Socket
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
            // .then(() => {
            //     const nsp = utils.websocketConnect(server, 'books', tokens[0])
            //     nsp.on('addedOrChanged', async(data: IBook[]) => {
            //         nsp.disconnect()
            //         data.forEach(item => {
            //             books = books.filter(book => book._id !== item._id)
            //             books.push(item)
            //         })
            //         console.log('books', books)
            //         done()
            //     })
            // })
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
        // let removed: string[] = []
        // let myBook: IBook
        // before(() => {
        //     nsp.on('removed', (ids: string[]) => {
        //         removed = removed.concat(ids)
        //     })
        //     return utils.createBook(server, tokens[0], 'to delete')
        //     .then(id => utils.getBook(server, tokens[0], id))
        //     .then(book => myBook = book)
        // })

        // after(() => nsp.removeListener('removed'))

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

// describe('Book Socket', () => {
//     let tokens: string[] = []
//     let userIds: string[] = []

//     before(() => {
//         return utils.testSetup()
//         .then(setup => ({ userIds, tokens } = setup))
//     })

//     after(() => {
//         return utils.cleanDb()
//     })

//     describe('authentication', () => {
//         it('should return an error if no token is provided', (t, done) => {
//             let socket = utils.websocketConnect('books', 'aaa')
//             socket.onmessage = (ev) => {
//                 t.assert.equal(ev.data, 'jwt malformed')
//                 socket.close()
//                 done()
//             }
//         })
//     })

//     describe('onAddedOrChanged channel', () => {
//         describe('initial response', () => {
//             it('should send a list of all books that user owns', done => {
//                 Promise.all([
//                     utils.createBook(tokens[0], 'user1'),
//                     utils.createBook(tokens[1], 'user2')
//                 ])
//                 .then(books => {
//                     let socket = utils.websocketConnect('books', tokens[0])
//                     socket.on('addedOrChanged', (data: IBook[]) => {
//                         expect(data[0]._id).to.equal(books[0])
//                         expect(data.length).to.equal(1)
//                         socket.disconnect()
//                         done()
//                     })
//                 })
//             })

//             it('should send books that a user can edit', (t) => {
//                 Promise.all([
//                     utils.createBook(tokens[1], 'book1'),
//                     utils.createBook(tokens[1], 'book1')
//                 ])
//                 .then(bookIds => {
//                     return new Promise(resolve => {
//                         // Book does not show up in response
//                         let socket = utils.websocketConnect('books', tokens[0])
//                         socket.on('addedOrChanged', (data: IBook[]) => {
//                             expect(data.filter(d => d._id === bookIds[0]).length).to.equal(0)
//                             socket.disconnect()
//                             resolve()
//                         })
//                     })
//                     .then(() => utils.getBook(tokens[1], bookIds[0]))
//                     .then(book => {
//                         book.editors.push(userIds[0])
//                         return utils.updateBook(tokens[1], book)
//                     })
//                     .then(() => bookIds[0])
//                 })
//                 .then(canEditId => {
//                     let socket = utils.websocketConnect('books', tokens[0])
//                     socket.on('addedOrChanged', (data: IBook[]) => {
//                         expect(data.filter(d => d._id === canEditId).length).to.equal(1)
//                         socket.disconnect()
//                         done()
//                     })
//                 })
//             })

//             it('should send books that a user can view', done => {
//                 utils.createBook(tokens[1], 'book3')
//                 .then(bookId => {
//                     return new Promise(resolve => {
//                         // Book does not show up in response
//                         let socket = utils.websocketConnect('books', tokens[0])
//                         socket.on('addedOrChanged', (data: IBook[]) => {
//                             expect(data.filter(d => d._id === bookId).length).to.equal(0)
//                             socket.disconnect()
//                             resolve()
//                         })
//                     })
//                     .then(() => utils.getBook(tokens[1], bookId))
//                     .then(book => {
//                         book.viewers.push(userIds[0])
//                         return utils.updateBook(tokens[1], book)
//                     })
//                     .then(() => bookId)
//                 })
//                 .then(canEditId => {
//                     let socket = utils.websocketConnect('books', tokens[0])
//                     socket.on('addedOrChanged', (data: IBook[]) => {
//                         expect(data.filter(d => d._id === canEditId).length).to.equal(1)
//                         socket.disconnect()
//                         done()
//                     })
//                 })
//             })
//         })

//         describe('secondary responses', () => {
//             let socket: SocketIOClient.Socket
//             let books: IBook[] = []

//             before(done => {
//                 let first: boolean = true
//                 socket = utils.websocketConnect('books', tokens[2])
//                 socket.on('addedOrChanged', data => {
//                     books = books.concat(data)
//                     if (first) {
//                         first = false
//                         done()
//                     }
//                 })
//             })

//             after(() => socket.disconnect())

//             beforeEach(() => books = [])

//             it('should send an item when it is added', () => {
//                 expect(books.length).to.equal(0)
//                 return utils.createBook(tokens[2], 'alwefjowie')
//                 .then(bookId => {
//                     expect(books.length).to.equal(1)
//                     expect(books[0]._id).to.equal(bookId)
//                 })
//             })

//             it('should send an item when it is updated', () => {
//                 const updatedName = 'waeiouweofiuwqioefu'
//                 return utils.createBook(tokens[2], 'woifjjw')
//                 .then(bookId => utils.getBook(tokens[2], bookId))
//                 .then(book => {
//                     books = []
//                     book.name = updatedName
//                     return utils.updateBook(tokens[2], book)
//                 })
//                 .then(() => expect(books.length).to.equal(1))
//                 .then(() => expect(books[0].name).to.equal(updatedName))
//             })

//             it('should send an item if a user is added as an editor', done => {
//                 let secondSocket = utils.websocketConnect('books', tokens[1])
//                 let isFirst: boolean = true
//                 let bookId: string
//                 secondSocket.on('addedOrChanged', (data: IBook[]) => {
//                     if (isFirst) {
//                         isFirst = false
//                         utils.createBook(tokens[0], 'toShareAsEditor')
//                         .then(bookId => utils.getBook(tokens[0], bookId))
//                         .then(book => {
//                             bookId = book._id
//                             book.editors.push(userIds[1])
//                             return utils.updateBook(tokens[0], book)
//                         })
//                     } else {
//                         expect(data.length).to.equal(1)
//                         expect(data[0]._id).to.equal(bookId)
//                         secondSocket.disconnect()
//                         done()
//                     }
//                 })
//             })

//             it('should send an item if a user is added as a viewer', done => {
//                 let secondSocket = utils.websocketConnect('books', tokens[1])
//                 let isFirst: boolean = true
//                 let bookId: string
//                 secondSocket.on('addedOrChanged', (data: IBook[]) => {
//                     if (isFirst) {
//                         isFirst = false
//                         utils.createBook(tokens[0], 'toShareAsViewer')
//                         .then(bookId => utils.getBook(tokens[0], bookId))
//                         .then(book => {
//                             bookId = book._id
//                             book.viewers.push(userIds[1])
//                             return utils.updateBook(tokens[0], book)
//                         })
//                     } else {
//                         expect(data.length).to.equal(1)
//                         expect(data[0]._id).to.equal(bookId)
//                         secondSocket.disconnect()
//                         done()
//                     }
//                 })
//             })

//             it('should send an item if a book becomes public', done => {
//                 let secondSocket = utils.websocketConnect('books', tokens[1])
//                 let isFirst: boolean = true
//                 let bookId: string
//                 secondSocket.on('addedOrChanged', (data: IBook[]) => {
//                     if (isFirst) {
//                         isFirst = false
//                         utils.createBook(tokens[0], 'toGoPublic')
//                         .then(bookId => utils.getBook(tokens[0], bookId))
//                         .then(book => {
//                             bookId = book._id
//                             book.isPublic = true
//                             return utils.updateBook(tokens[0], book)
//                         })
//                     } else {
//                         expect(data.length).to.equal(1)
//                         expect(data[0]._id).to.equal(bookId)
//                         secondSocket.disconnect()
//                         done()
//                     }
//                 })
//             })
//         })
//     })

//     describe('removed channel', () => {
//         it('should send an id if an item is deleted', done => {
//             let socket = utils.websocketConnect('books', tokens[1])
//             let removedId: string
//             socket.on('removed', (data) => {
//                 expect(data[0]).to.equal(removedId)
//                 socket.disconnect()
//                 done()
//             })

//             utils.createBook(tokens[1], 'toBeRemoved')
//             .then(bookId => {
//                 removedId = bookId
//                 return utils.deleteBook(tokens[1], bookId)
//             })
//         })

//         it('should send an id to a user if they are no longer an editor', done => {
//             let socket = utils.websocketConnect('books', tokens[1])
//             let removedId: string

//             socket.on('removed', (data) => {
//                 expect(data[0]).to.equal(removedId)
//                 socket.disconnect()
//                 done()
//             })

//             utils.createBook(tokens[0], 'toBeRemoved')
//             .then(bookId => utils.getBook(tokens[0], bookId))
//             .then(book => {
//                 removedId = book._id
//                 book.editors.push(userIds[1])
//                 return utils.updateBook(tokens[0], book)
//                 .then(() => utils.deleteBook(tokens[0], book._id))
//             })
//         })

//         it('should send an id to a user if they are no longer a viewer', done => {
//             let socket = utils.websocketConnect('books', tokens[1])
//             let removedId: string

//             socket.on('removed', (data) => {
//                 expect(data[0]).to.equal(removedId)
//                 socket.disconnect()
//                 done()
//             })

//             utils.createBook(tokens[0], 'toBeRemoved')
//             .then(bookId => utils.getBook(tokens[0], bookId))
//             .then(book => {
//                 removedId = book._id
//                 book.viewers.push(userIds[1])
//                 return utils.updateBook(tokens[0], book)
//                 .then(() => utils.deleteBook(tokens[0], book._id))
//             })
//         })

//         it('should send an id if item is no longer public', done => {
//             let socket = utils.websocketConnect('books', tokens[1])
//             let publicId: string

//             socket.on('removed', (data) => {
//                 expect(data[0]).to.equal(publicId)
//                 socket.disconnect()
//                 done()
//             })

//             utils.createBook(tokens[0], 'toBeRemoved')
//             .then(bookId => utils.getBook(tokens[0], bookId))
//             .then(book => {
//                 publicId = book._id
//                 book.isPublic = true
//                 return book
//             })
//             .then(book => {
//                 return utils.updateBook(tokens[0], book)
//                 .then(() => utils.deleteBook(tokens[0], book._id))
//             })
//         })
//     })
// })
