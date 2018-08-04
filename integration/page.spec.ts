import * as chai from 'chai'
import 'chai-http'
import * as utils from './utils'
import { IPage, IBook } from 'common/models'
const expect = chai.expect

describe('Page API', () => {
    let bookId: string
    let tokens: string[]
    let userIds: string[]
    let server: Express.Application

    before(done => {
        utils.testSetup()
        .then(setup => ({ userIds, tokens, server } = setup))
        .then(() => utils.createBook(tokens[0], 'myBook'))
        .then(id => bookId = id)
        .then(() => done())
    })

    after(done => {
        utils.cleanDb()
        .then(() => done())
    })

    describe('POST /api/pages', () => {
        let myBook: IBook
        beforeEach(done => {
            utils.getBook(tokens[0], bookId)
            .then(book => myBook = book)
            .then(() => done())
        })

        it('should return an error if the user does not have edit access', done => {
            expect(myBook.editors.indexOf(userIds[1])).to.equal(-1)

            chai.request(server)
            .post('/api/pages')
            .set('authorization', tokens[1])
            .send({
                name: 'afwehjlkw',
                bookId: bookId
            })
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => done())
        })

        it('should return a success if user has owner access to the book', done => {
            chai.request(server)
            .post('/api/pages')
            .set('authorization', tokens[0])
            .send({
                name: 'afwehjlkw',
                bookId: bookId
            })
            .then(res => expect(res.status).to.equal(200))
            .then(() => done())
        })

        it('should return a success if user has edit access', done => {
            myBook.editors.push(userIds[1])
            utils.updateBook(tokens[0], myBook)
            .then(() => chai.request(server)
            .post('/api/pages')
            .set('authorization', tokens[0])
            .send({
                name: 'editor page',
                bookId: bookId
            }))
            .then(res => expect(res.status).to.equal(200))
            .then(() => done())
        })

        it('should return an error if user is NOT logged in', done => {
            chai.request(server)
            .post('/api/pages')
            .send({
                name: 'afwehjlkw',
                bookId: bookId
            })
            .then(res => expect(res.status).to.equal(401))
            .then(() => done())
        })
    })

    describe('PUT /api/pages', () => {
        let myBook: IBook
        let myPages: IPage[]

        beforeEach(done => {
            utils.getBook(tokens[0], bookId)
            .then(book => myBook = book)
            .then(() => utils.getPages(tokens[0], bookId))
            .then(pages => myPages = pages)
            .then(() => done())
        })

        it('should return an error if user is NOT logged in', done => {
            chai.request(server)
            .put('/api/pages')
            .send({})
            .then(res => expect(res.status).to.equal(401))
            .then(() => done())
        })

        it('should return a success if user is the owner of the parent book', done => {
            let myPage: IPage = myPages[0]
            expect(myBook._id).to.equal(myPage.bookId)
            expect(myBook.owner).to.equal(userIds[0])

            chai.request(server)
            .put('/api/pages')
            .set('authorization', tokens[0])
            .send(myPage)
            .then(res => expect(res.status).to.equal(200))
            .then(() => done())
        })

        it('should return a success if user is an editor of the parent book', done => {
            let myPage: IPage = myPages[0]
            expect(myPage).not.to.equal(undefined)

            utils.decodeToken(tokens[1])
            .then(decoded => myBook.editors.push(decoded._id))
            .then(() => utils.updateBook(tokens[0], myBook))
            .then(() => {
                return chai.request(server)
                .put('/api/pages')
                .set('authorization', tokens[1])
                .send(myPage)
            })
            .then(res => expect(res.status).to.equal(200))
            .then(() => done())
        })

        it('should return a failure if user NOT an owner or an editor', done => {
            let myPage: IPage = myPages[0]
            expect(myPage).not.to.equal(undefined)

            chai.request(server)
            .put('/api/pages')
            .set('authorization', tokens[2])
            .send(myPage)
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => done())

        })

        it('should return a failure if schema does not match', done => {
            let myPage: any = myPages[0]
            expect(myPage).not.to.equal(undefined)
            myPage.name = { badData: 'awekfjwef' }

            chai.request(server)
            .put('/api/pages')
            .set('authorization', tokens[0])
            .send(myPage)
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => done())
        })
    })

    describe('DELETE /api/pages', () => {
        let myBook: IBook
        let myPages: IPage[]

        beforeEach(done => {
            utils.getPages(tokens[0], bookId)
            .then(data => myPages = data)
            .then(() => utils.getBook(tokens[0], bookId))
            .then(data => myBook = data)
            .then(() => done())
        })

        it('should return a failure if user is not logged in', done => {
            chai.request(server)
            .del('/api/pages/myID')
            .then(res => expect(res.status).to.equal(401))
            .then(() => done())
        })

        it('should return an error if page does NOT exist', done => {
            expect(myBook.owner).to.equal(userIds[0])

            chai.request(server)
            .del('/api/pages/badId')
            .set('authorization', tokens[0])
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => done())
        })

        it('should return a success if the user is the owner of the parent book', done => {
            utils.createPage(tokens[0], bookId, 'to remove')
            .then(pageId => {
                return chai.request(server)
                .del(`/api/pages/${pageId}`)
                .set('authorization', tokens[0])
                .then(res => expect(res.status).to.equal(200))
                .then(() => utils.getPages(tokens[0], bookId))
                .then(pages => expect(pages.filter(p => p._id === pageId).length).to.equal(0))
            })
            .then(() => done())
        })

        it('should return a success if the user is an editor of the parent book', done => {
            expect(myBook.editors.indexOf(userIds[1])).not.to.equal(-1)

            utils.createPage(tokens[0], bookId, 'editor remove')
            .then(pageId => {
                return chai.request(server)
                .del(`/api/pages/${pageId}`)
                .set('authorization', tokens[1])
                .then(res => expect(res.status).to.equal(200))
                .then(() => utils.getPages(tokens[0], bookId))
                .then(pages => expect(pages.filter(p => p._id === pageId).length).to.equal(0))
            })
            .then(() => done())
        })
    })
})

describe('Page Socket', () => {
    let tokens: string[]
    let userIds: string[]

    before(done => {
        utils.testSetup()
        .then(setup => ({ userIds, tokens } = setup))
        .then(() => done())
    })

    after(done => {
        utils.cleanDb()
        .then(() => done())
    })

    describe('athorization', () => {
        let bookId: string
        let book: IBook
        before(done => {
            utils.createBook(tokens[0], 'authbook')
            .then(id => bookId = id)
            .then(() => done())
        })

        beforeEach(done => {
            utils.getBook(tokens[0], bookId)
            .then(res => book = res)
            .then(() => done())
        })

        it('should NOT let you join a room if you do NOT have access to the parent book', done => {
            const socket = utils.websocketConnect('pages', tokens[1])
            socket.emit('join', bookId)
            socket.on('message', data => {
                socket.disconnect()
                expect(data).to.contain(bookId)
                done()
            })
        })

        it('should return records if user is the owner of the book', done => {
            expect(userIds[0]).to.equal(book.owner)

            const socket = utils.websocketConnect('pages', tokens[0])
            socket.emit('join', bookId)
            socket.on('addedOrChanged', data => {
                socket.disconnect()
                done()
            })
        })

        it('should return records if user has edit access to the book', done => {
            book.editors.push(userIds[1])

            utils.updateBook(tokens[0], book)
            .then(() => {
                const socket = utils.websocketConnect('pages', tokens[1])
                socket.emit('join', bookId)
                socket.on('addedOrChanged', data => {
                    socket.disconnect()
                    done()
                })
            })
        })

        it('should return records if user has viewer access to the book', done => {
            book.editors = []
            book.viewers.push(userIds[1])

            utils.updateBook(tokens[0], book)
            .then(() => {
                const socket = utils.websocketConnect('pages', tokens[1])
                socket.emit('join', bookId)
                socket.on('addedOrChanged', data => {
                    socket.disconnect()
                    done()
                })
            })
        })

        it('should return records if book is public', done => {
            expect(book.owner).not.to.equal(userIds[2])
            expect(book.editors.indexOf(userIds[2])).to.equal(-1)
            expect(book.viewers.indexOf(userIds[2])).to.equal(-1)
            book.isPublic = true

            utils.updateBook(tokens[0], book)
            .then(() => {
                const socket = utils.websocketConnect('pages', tokens[2])
                socket.emit('join', bookId)
                socket.on('addedOrChanged', data => {
                    socket.disconnect()
                    done()
                })
            })
        })

        it('should return an error if user tried to join a room that does not exist', done => {
            const socket = utils.websocketConnect('pages', tokens[2])
            socket.emit('join', 'badid')
            socket.on('message', data => {
                socket.disconnect()
                done()
            })
        })
    })

    describe('addedOrChanged channel', () => {
        let bookId: string

        before(done => {
            utils.createBook(tokens[0], 'kwuheiwnecuiawe')
            .then(id => bookId = id)
            .then(() => done())
        })

        it("should return all pages in a book when joining a book's room", done => {
            utils.createPage(tokens[0], bookId, 'jvoairjr')
            .then(pageId => {
                const socket = utils.websocketConnect('pages', tokens[0])
                socket.emit('join', bookId)
                socket.on('addedOrChanged', (data: IPage[]) => {
                    socket.disconnect()
                    expect(data.filter(x => x._id === pageId).length).to.be.greaterThan(0)
                    done()
                })
            })
        })

        it('should return a record when a page is added', done => {
            const pageName: string = 'awleoivjwerwerv'
            let isFirst: boolean = true
            const socket = utils.websocketConnect('pages', tokens[0])
            socket.emit('join', bookId)
            socket.on('addedOrChanged', (data: IPage[]) => {
                if (isFirst) {
                    isFirst = false
                    utils.createPage(tokens[0], bookId, pageName)
                } else {
                    socket.disconnect()
                    expect(data[0].name).to.equal(pageName)
                    done()
                }
            })
        })

        it('should return a record when a page is updated', done => {
            const updateName: string = 'im different'
            let isFirst: boolean = true

            utils.getPages(tokens[0], bookId)
            .then(pages => pages[0])
            .then(page => {
                expect(page.name).not.to.equal(updateName)
                page.name = updateName

                const socket = utils.websocketConnect('pages', tokens[0])
                socket.emit('join', bookId)
                socket.on('addedOrChanged', (data: IPage[]) => {
                    if (isFirst) {
                        isFirst = false
                        utils.updatePage(tokens[0], page)
                    } else {
                        socket.disconnect()
                        expect(data[0].name).to.equal(updateName)
                        done()
                    }
                })
            })
        })
    })

    describe('removed channel', () => {
        let bookId: string

        before(done => {
            utils.createBook(tokens[0], 'aweaowijecaec')
            .then(id => bookId = id)
            .then(() => done())
        })

        it('should return the id of a deleted page', done => {
            let pageId: string

            const socket = utils.websocketConnect('pages', tokens[0])
            socket.emit('join', bookId)
            socket.on('removed', (data: string) => {
                socket.disconnect()
                expect(data[0]).to.equal(pageId)
                done()
            })

            utils.createPage(tokens[0], bookId, 'myPage')
            .then(id => pageId = id)
            .then(() => utils.deletePage(tokens[0], pageId))
        })
    })
})
