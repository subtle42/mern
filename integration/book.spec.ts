import * as chai from 'chai'
import 'chai-http'
import { IBook } from 'common/models'
import * as utils from './utils'
const expect = chai.expect

describe('Book API', () => {
    let tokens: string[]
    let nsp: SocketIOClient.Socket
    let userIds: string[]
    let books: IBook[] = []
    let server: Express.Application

    before(() => {
        return utils.testSetup()
        .then(setup => ({ userIds, tokens, server } = setup))
        .then(() => {
            nsp = utils.websocketConnect('books', tokens[0])
            nsp.on('addedOrChanged', (data: IBook[]) => {
                data.forEach(item => {
                    books = books.filter(book => book._id !== item._id)
                    books.push(item)
                })
            })
        })
    })

    after(() => {
        return nsp.disconnect()
    })

    describe('POST /api/books', () => {
        const testName = 'unitTest'

        it('should return an error if user is NOT logged in', () => {
            return chai.request(server)
            .post('/api/books')
            .send({ name: testName })
            .then(res => expect(res.status).not.to.equal(200))
        })

        it('should create a new book', () => {
            return chai.request(server)
            .post('/api/books')
            .set('Authorization', tokens[0])
            .send({ name: testName })
            .then(res => {
                expect(res.status).to.equal(200)
                return utils.getBook(tokens[0], res.body)
            })
            .then(book => {
                expect(book.name).to.equal(testName)
                expect(book.owner).to.equal(userIds[0])
            })
        })
    })

    describe('PUT /api/books', () => {
        let bookId: string
        let myBook: IBook

        before(() => {
            return utils.createBook(tokens[0], 'update book test')
            .then(id => bookId = id)
        })

        beforeEach(() => {
            return utils.getBook(tokens[0], bookId)
            .then(book => myBook = book)
        })

        it('should return an error if user is NOT logged in', () => {
            return chai.request(server)
            .put('/api/books')
            .send(myBook)
            .then(res => expect(res.status).to.equal(401))
        })

        it('should return an error if user is NOT owner or editor', () => {
            expect(myBook.owner).not.to.equal(userIds[1])
            const newName = 'fawliejfwalef'
            myBook.name = newName

            return chai.request(server)
            .put('/api/books')
            .set('authorization', tokens[1])
            .send(myBook)
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => utils.getBook(tokens[0], myBook._id))
            .then(book => expect(book.name).not.to.equal(newName))
        })

        it('should return a success if user is the owner', () => {
            expect(myBook.owner).to.equal(userIds[0])
            return chai.request(server)
            .put('/api/books')
            .set('authorization', tokens[0])
            .send(books[0])
            .then(res => expect(res.status).to.equal(200))
        })

        it('should return a success if user is an editor', () => {
            const newName = 'editor update'
            myBook.editors.push(userIds[1])

            return chai.request(server)
            .put('/api/books')
            .set('authorization', tokens[0])
            .send(myBook)
            .then(res => {
                expect(res.status).to.equal(200)
                myBook.name = newName
                return chai.request(server)
                .put('/api/books')
                .set('authorization', tokens[1])
                .send(myBook)
            })
            .then(res => expect(res.status).to.equal(200))
            .then(() => utils.getBook(tokens[1], myBook._id))
            .then(book => expect(book.name).to.equal(newName))
        })

        it('should return an error if schema does NOT match', () => {
            let tmp: any = myBook
            tmp.name = { bad: 'data' }
            return chai.request(server)
            .put('/api/books')
            .set('Authorization', tokens[0])
            .send(tmp)
            .then(res => expect(res.status).not.to.equal(200))
        })

        it('should return an error if a user other than the owner tries to change the owner', () => {
            expect(myBook.owner).to.equal(userIds[0])
            expect(myBook.editors.indexOf(userIds[1])).not.to.equal(-1)
            myBook.owner = userIds[1]

            return chai.request(server)
            .put('/api/books')
            .set('authorization', tokens[1])
            .send(myBook)
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => utils.getBook(tokens[0], myBook._id))
            .then(book => expect(book.owner).to.equal(userIds[0]))
        })

        it('should return a success if the owner changes the owner field', () => {
            expect(myBook.owner).to.equal(userIds[0])
            myBook.owner = userIds[1]
            return chai.request(server)
            .put('/api/books')
            .set('authorization', tokens[0])
            .send(myBook)
            .then(res => expect(res.status).to.equal(200))
        })
    })

    describe('DELETE /api/books', () => {
        let removed: string[] = []
        let myBook: IBook
        before(() => {
            nsp.on('removed', (ids: string[]) => {
                removed = removed.concat(ids)
            })
            return utils.createBook(tokens[0], 'to delete')
            .then(id => utils.getBook(tokens[0], id))
            .then(book => myBook = book)
        })

        after(() => nsp.removeListener('removed'))

        it('should return an error if user is NOT logged in', () => {
            return chai.request(server)
            .del(`/api/books/myBookID`)
            .then(res => expect(res.status).to.equal(401))
        })

        it('should return and error if book does NOT exist', () => {
            return chai.request(server)
            .del(`/api/books/myBookID`)
            .set('Authorization', tokens[0])
            .then(res => expect(res.status).not.to.equal(200))
        })

        it('should stop a delete if user is NOT the owner', () => {
            return chai.request(server)
            .del(`/api/books/${myBook._id}`)
            .set('Authorization', tokens[1])
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => utils.getBook(tokens[0], myBook._id))
            .then(book => expect(book).not.to.be.undefined)
        })
    })
})

describe('Book Socket', () => {
    let tokens: string[] = []
    let userIds: string[] = []
    let server: Express.Application

    before(() => {
        return utils.testSetup()
        .then(setup => ({ userIds, tokens, server } = setup))
    })

    after(() => {
        return utils.cleanDb()
    })

    describe('authentication', () => {
        it('should return an error if no token is provided', done => {
            let socket = utils.websocketConnect('books', 'aaa')
            socket.on('message', err => {
                expect(err.message).to.equal('jwt malformed')
                socket.disconnect()
                done()
            })
        })
    })

    describe('onAddedOrChanged channel', () => {
        describe('initial response', () => {
            it('should send a list of all books that user owns', done => {
                Promise.all([
                    utils.createBook(tokens[0], 'user1'),
                    utils.createBook(tokens[1], 'user2')
                ])
                .then(books => {
                    let socket = utils.websocketConnect('books', tokens[0])
                    socket.on('addedOrChanged', (data: IBook[]) => {
                        expect(data[0]._id).to.equal(books[0])
                        expect(data.length).to.equal(1)
                        socket.disconnect()
                        done()
                    })
                })
            })

            it('should send books that a user can edit', done => {
                Promise.all([
                    utils.createBook(tokens[1], 'book1'),
                    utils.createBook(tokens[1], 'book1')
                ])
                .then(bookIds => {
                    return new Promise(resolve => {
                        // Book does not show up in response
                        let socket = utils.websocketConnect('books', tokens[0])
                        socket.on('addedOrChanged', (data: IBook[]) => {
                            expect(data.filter(d => d._id === bookIds[0]).length).to.equal(0)
                            socket.disconnect()
                            resolve()
                        })
                    })
                    .then(() => utils.getBook(tokens[1], bookIds[0]))
                    .then(book => {
                        book.editors.push(userIds[0])
                        return utils.updateBook(tokens[1], book)
                    })
                    .then(() => bookIds[0])
                })
                .then(canEditId => {
                    let socket = utils.websocketConnect('books', tokens[0])
                    socket.on('addedOrChanged', (data: IBook[]) => {
                        expect(data.filter(d => d._id === canEditId).length).to.equal(1)
                        socket.disconnect()
                        done()
                    })
                })
            })

            it('should send books that a user can view', done => {
                utils.createBook(tokens[1], 'book3')
                .then(bookId => {
                    return new Promise(resolve => {
                        // Book does not show up in response
                        let socket = utils.websocketConnect('books', tokens[0])
                        socket.on('addedOrChanged', (data: IBook[]) => {
                            expect(data.filter(d => d._id === bookId).length).to.equal(0)
                            socket.disconnect()
                            resolve()
                        })
                    })
                    .then(() => utils.getBook(tokens[1], bookId))
                    .then(book => {
                        book.viewers.push(userIds[0])
                        return utils.updateBook(tokens[1], book)
                    })
                    .then(() => bookId)
                })
                .then(canEditId => {
                    let socket = utils.websocketConnect('books', tokens[0])
                    socket.on('addedOrChanged', (data: IBook[]) => {
                        expect(data.filter(d => d._id === canEditId).length).to.equal(1)
                        socket.disconnect()
                        done()
                    })
                })
            })
        })

        describe('secondary responses', () => {
            let socket: SocketIOClient.Socket
            let books: IBook[] = []

            before(done => {
                let first: boolean = true
                socket = utils.websocketConnect('books', tokens[2])
                socket.on('addedOrChanged', data => {
                    books = books.concat(data)
                    if (first) {
                        first = false
                        done()
                    }
                })
            })

            after(() => socket.disconnect())

            beforeEach(() => books = [])

            it('should send an item when it is added', () => {
                expect(books.length).to.equal(0)
                return utils.createBook(tokens[2], 'alwefjowie')
                .then(bookId => {
                    expect(books.length).to.equal(1)
                    expect(books[0]._id).to.equal(bookId)
                })
            })

            it('should send an item when it is updated', () => {
                const updatedName = 'waeiouweofiuwqioefu'
                return utils.createBook(tokens[2], 'woifjjw')
                .then(bookId => utils.getBook(tokens[2], bookId))
                .then(book => {
                    books = []
                    book.name = updatedName
                    return utils.updateBook(tokens[2], book)
                })
                .then(() => expect(books.length).to.equal(1))
                .then(() => expect(books[0].name).to.equal(updatedName))
            })

            it('should send an item if a user is added as an editor', done => {
                let secondSocket = utils.websocketConnect('books', tokens[1])
                let isFirst: boolean = true
                let bookId: string
                secondSocket.on('addedOrChanged', (data: IBook[]) => {
                    if (isFirst) {
                        isFirst = false
                        utils.createBook(tokens[0], 'toShareAsEditor')
                        .then(bookId => utils.getBook(tokens[0], bookId))
                        .then(book => {
                            bookId = book._id
                            book.editors.push(userIds[1])
                            return utils.updateBook(tokens[0], book)
                        })
                    } else {
                        expect(data.length).to.equal(1)
                        expect(data[0]._id).to.equal(bookId)
                        secondSocket.disconnect()
                        done()
                    }
                })
            })

            it('should send an item if a user is added as a viewer', done => {
                let secondSocket = utils.websocketConnect('books', tokens[1])
                let isFirst: boolean = true
                let bookId: string
                secondSocket.on('addedOrChanged', (data: IBook[]) => {
                    if (isFirst) {
                        isFirst = false
                        utils.createBook(tokens[0], 'toShareAsViewer')
                        .then(bookId => utils.getBook(tokens[0], bookId))
                        .then(book => {
                            bookId = book._id
                            book.viewers.push(userIds[1])
                            return utils.updateBook(tokens[0], book)
                        })
                    } else {
                        expect(data.length).to.equal(1)
                        expect(data[0]._id).to.equal(bookId)
                        secondSocket.disconnect()
                        done()
                    }
                })
            })

            it('should send an item if a book becomes public', done => {
                let secondSocket = utils.websocketConnect('books', tokens[1])
                let isFirst: boolean = true
                let bookId: string
                secondSocket.on('addedOrChanged', (data: IBook[]) => {
                    if (isFirst) {
                        isFirst = false
                        utils.createBook(tokens[0], 'toGoPublic')
                        .then(bookId => utils.getBook(tokens[0], bookId))
                        .then(book => {
                            bookId = book._id
                            book.isPublic = true
                            return utils.updateBook(tokens[0], book)
                        })
                    } else {
                        expect(data.length).to.equal(1)
                        expect(data[0]._id).to.equal(bookId)
                        secondSocket.disconnect()
                        done()
                    }
                })
            })
        })
    })

    describe('removed channel', () => {
        it('should send an id if an item is deleted', done => {
            let socket = utils.websocketConnect('books', tokens[1])
            let removedId: string
            socket.on('removed', (data) => {
                expect(data[0]).to.equal(removedId)
                socket.disconnect()
                done()
            })

            utils.createBook(tokens[1], 'toBeRemoved')
            .then(bookId => {
                removedId = bookId
                return utils.deleteBook(tokens[1], bookId)
            })
        })

        it('should send an id to a user if they are no longer an editor', done => {
            let socket = utils.websocketConnect('books', tokens[1])
            let removedId: string

            socket.on('removed', (data) => {
                expect(data[0]).to.equal(removedId)
                socket.disconnect()
                done()
            })

            utils.createBook(tokens[0], 'toBeRemoved')
            .then(bookId => utils.getBook(tokens[0], bookId))
            .then(book => {
                removedId = book._id
                book.editors.push(userIds[1])
                return utils.updateBook(tokens[0], book)
                .then(() => utils.deleteBook(tokens[0], book._id))
            })
        })

        it('should send an id to a user if they are no longer a viewer', done => {
            let socket = utils.websocketConnect('books', tokens[1])
            let removedId: string

            socket.on('removed', (data) => {
                expect(data[0]).to.equal(removedId)
                socket.disconnect()
                done()
            })

            utils.createBook(tokens[0], 'toBeRemoved')
            .then(bookId => utils.getBook(tokens[0], bookId))
            .then(book => {
                removedId = book._id
                book.viewers.push(userIds[1])
                return utils.updateBook(tokens[0], book)
                .then(() => utils.deleteBook(tokens[0], book._id))
            })
        })

        it('should send an id if item is no longer public', done => {
            let socket = utils.websocketConnect('books', tokens[1])
            let publicId: string

            socket.on('removed', (data) => {
                expect(data[0]).to.equal(publicId)
                socket.disconnect()
                done()
            })

            utils.createBook(tokens[0], 'toBeRemoved')
            .then(bookId => utils.getBook(tokens[0], bookId))
            .then(book => {
                publicId = book._id
                book.isPublic = true
                return book
            })
            .then(book => {
                return utils.updateBook(tokens[0], book)
                .then(() => utils.deleteBook(tokens[0], book._id))
            })
        })
    })
})
