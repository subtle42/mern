import { IBook } from './model'
import {describe, before, after, it, beforeEach} from 'node:test'
import { FastifyInstance } from 'fastify'
import { getWsMessage, TestEnv, testSetup } from 'server/testUtils'

describe('Book API', () => {
    let tokens: string[]
    let userIds: string[]
    let server: FastifyInstance
    let utils: TestEnv

    before(async() => {
        ({server, utils, userIds, tokens} = await testSetup())
    })

    after(async() => {
        await utils.cleanup()
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
            const book = await utils.book.get(tokens[0], res.body)
            t.assert.equal(book.name, testName)
            t.assert.equal(book.owner, userIds[0])
        })
    })

    describe('PUT /api/books', () => {
        let bookId: string
        let myBook: IBook

        before(async() => {
            bookId = await utils.book.create(tokens[0], 'update book test')
        })

        beforeEach(async() => {
            myBook = await utils.book.get(tokens[0], bookId)
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
            const book = await utils.book.get(tokens[0], myBook._id)
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
            const serverBook = await utils.book.get(tokens[1], myBook._id)
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
            const serverBook = await utils.book.get(tokens[0], myBook._id)
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
            const bookId = await utils.book.create(tokens[0], 'wejkwflkjw')
            const res = await server.inject()
                .delete(`/api/books/${bookId}`)
                .headers({authorization: tokens[1]})
            t.assert.notEqual(res.statusCode, 200)
            const serverBook = await utils.book.get(tokens[0], bookId)
            t.assert.notEqual(serverBook, undefined)
        })

        it('should return a success if user is the owner', async(t) => {
            const bookId = await utils.book.create(tokens[1], 'aewrgtfefe')
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
    let utils: TestEnv

    before(async() => {
        ({ userIds, tokens, server, utils } = await testSetup())
    })

    after(async() => {
        await utils.cleanup()
    })

    describe('authentication', () => {
        it('should return an error if no token is provided', (t, done) => {
            utils.websocketConnect('aaa')
            .catch(err => done())
        })
    })

    describe('onAddedOrChanged channel', () => {
        const socketOpts = {namespace: 'books', channel: 'addedOrChanged'}

        describe('initial response', () => {
            it('should send a list of all books that user owns', async(t) => {
                const book1 = await utils.book.create(tokens[0], 'user1')
                const book2 = await utils.book.create(tokens[1], 'user2')
                const socket = await utils.websocketConnect(tokens[0])
                const data = await getWsMessage<IBook[]>(socket, socketOpts)
                t.assert.equal(data[0]._id, book1)
                t.assert.equal(data.length, 1)
                socket.terminate()
            })

            it('should send books that a user can edit', async(t) => {
                const bookId1 = await utils.book.create(tokens[1], 'book1')
                const bookId2 = await utils.book.create(tokens[1], 'book3')
                const socket = await utils.websocketConnect(tokens[0])
                const msg = await getWsMessage<IBook[]>(socket, socketOpts)
                socket.terminate()

                t.assert.equal(msg.filter(d => d._id === bookId1).length, 0)
                const book = await utils.book.get(tokens[1], bookId1)
                book.editors.push(userIds[0])
                await utils.book.update(tokens[1], book)

                const socket2 = await utils.websocketConnect(tokens[0])
                const msg2 = await getWsMessage<IBook[]>(socket2, socketOpts)
                socket2.terminate()
                t.assert.equal(msg2.filter(d => d._id === bookId1).length, 1)
            })

            it('should send books that a user can view', async(t) => {
                const bookId = await utils.book.create(tokens[1], 'book3')
                const emptySocket = await utils.websocketConnect(tokens[0])
                const emptyData = await getWsMessage<IBook[]>(emptySocket, socketOpts)
                t.assert.equal(emptyData.filter(d => d._id === bookId).length, 0)
                emptySocket.terminate()

                const myBook = await utils.book.get(tokens[1], bookId)
                myBook.viewers.push(userIds[0])
                await utils.book.update(tokens[1], myBook)

                const dataSocket = await utils.websocketConnect(tokens[0])
                const withData = await getWsMessage<IBook[]>(dataSocket, socketOpts)
                t.assert.equal(withData.filter(d => d._id === bookId).length, 1)
                dataSocket.terminate()
            })
        })

        describe('secondary responses', () => {
            it('should send an item when it is added', async(t) => {
                const socket = await utils.websocketConnect(tokens[2])
                let isFirst = true
                let firstResolve;
                const firstCall = new Promise<IBook[]>(r => { firstResolve = r })
                let secondResolve;
                const secondCall = new Promise<IBook[]>(r => { secondResolve = r })

                socket.on('message', ev => {
                    const {channel, namespace, data} = JSON.parse(ev.toString())
                    if (namespace !== socketOpts.namespace) return
                    if (channel !== socketOpts.channel) return
                    isFirst ? firstResolve(data) : secondResolve(data)
                    isFirst = false
                })

                t.assert.equal((await firstCall).length, 0)
                const bookId = await utils.book.create(tokens[2], 'alwefjowie')
                const secondData = await secondCall
                t.assert.equal(secondData.length, 1)
                t.assert.equal(secondData[0]._id, bookId)
                socket.terminate()
            })

            it('should send an item when it is updated', async(t) => {
                const bookId = await utils.book.create(tokens[2], 'woifjjw')
                const socket = await utils.websocketConnect(tokens[2])
                const updatedName = 'waeiouweofiuwqioefu'
                let isFirst = true
                let firstResolve;
                const firstCall = new Promise<IBook[]>(r => { firstResolve = r })
                let secondResolve;
                const secondCall = new Promise<IBook[]>(r => { secondResolve = r })
                
                socket.on('message', ev => {
                    const {channel, namespace, data} = JSON.parse(ev.toString())
                    if (namespace !== socketOpts.namespace) return
                    if (channel !== socketOpts.channel) return
                    isFirst ? firstResolve(data) : secondResolve(data)
                    isFirst = false
                });

                const myBook = (await firstCall).find(x => x._id === bookId)
                myBook.name = updatedName
                await utils.book.update(tokens[2], myBook)
                t.assert.equal((await secondCall).find(x => x._id === bookId).name, updatedName)
                socket.terminate()
            })

            it('should send an item if a user is added as an editor', async(t) => {
                const socket = await utils.websocketConnect(tokens[1])
                let isFirst = true
                let firstResolve;
                const firstCall = new Promise<IBook[]>(r => { firstResolve = r })
                let secondResolve;
                const secondCall = new Promise<IBook[]>(r => { secondResolve = r })
                
                socket.on('message', ev => {
                    const {channel, namespace, data} = JSON.parse(ev.toString())
                    if (namespace !== socketOpts.namespace) return
                    if (channel !== socketOpts.channel) return
                    isFirst ? firstResolve(data) : secondResolve(data)
                    isFirst = false
                });

                await firstCall
                const bookId = await utils.book.create(tokens[0], 'toShareAsEditor')
                const book = await utils.book.get(tokens[0], bookId)
                book.editors.push(userIds[1])
                await utils.book.update(tokens[0], book)
                const data = await secondCall
                t.assert.equal(data.length, 1)
                t.assert.equal(data[0]._id, bookId)
                socket.terminate()
            })

            it('should send an item if a user is added as a viewer', async(t) => {
                const socket = await utils.websocketConnect(tokens[1])
                let isFirst = true
                let firstResolve;
                const firstCall = new Promise<IBook[]>(r => { firstResolve = r })
                let secondResolve;
                const secondCall = new Promise<IBook[]>(r => { secondResolve = r })
                
                socket.on('message', ev => {
                    const {channel, namespace, data} = JSON.parse(ev.toString())
                    if (namespace !== socketOpts.namespace) return
                    if (channel !== socketOpts.channel) return
                    isFirst ? firstResolve(data) : secondResolve(data)
                    isFirst = false
                });

                await firstCall
                const bookId = await utils.book.create(tokens[0], 'toShareAsViewer')
                const book = await utils.book.get(tokens[0], bookId)
                book.viewers.push(userIds[1])
                await utils.book.update(tokens[0], book)
                const data = await secondCall
                t.assert.equal(data.length, 1)
                t.assert.equal(data[0]._id, bookId)
                socket.terminate()
            })

            it('should send an item if a book becomes public', async(t) => {
                const socket = await utils.websocketConnect(tokens[1])
                let isFirst = true
                let firstResolve;
                const firstCall = new Promise<IBook[]>(r => { firstResolve = r })
                let secondResolve;
                const secondCall = new Promise<IBook[]>(r => { secondResolve = r })
                
                socket.on('message', ev => {
                    const {channel, namespace, data} = JSON.parse(ev.toString())
                    if (namespace !== socketOpts.namespace) return
                    if (channel !== socketOpts.channel) return
                    isFirst ? firstResolve(data) : secondResolve(data)
                    isFirst = false
                });

                await firstCall
                const bookId = await utils.book.create(tokens[0], 'toGoPublic')
                const book = await utils.book.get(tokens[0], bookId)
                book.isPublic = true
                await utils.book.update(tokens[0], book)
                const data = await secondCall
                t.assert.equal(data.length, 1)
                t.assert.equal(data[0]._id, bookId)
                socket.terminate()
            })
        })
    })

    describe('removed channel', () => {
        const myNamespace = 'books'

        it('should send an id if an item is deleted', async(t) => {
            const socket = await utils.websocketConnect(tokens[1])
            let addResolve;
            const addCall = new Promise<IBook[]>(r => { addResolve = r })
            let removeResolve;
            const removeCall = new Promise<IBook[]>(r => { removeResolve = r })
                
            socket.on('message', ev => {
                const {channel, namespace, data} = JSON.parse(ev.toString())
                if (myNamespace !== namespace) return
                if (channel === 'addedOrChanged') return addResolve(data)
                if (channel === 'removed') return removeResolve(data)
            });

            const removeId = await utils.book.create(tokens[1], 'toBeRemoved')
            await addCall
            await utils.book.remove(tokens[1], removeId)
            const data = await removeCall
            t.assert.equal(data[0], removeId)
            socket.terminate()
        })

        it('should send an id to a user if they are an editor', async(t) => {
            const socket = await utils.websocketConnect(tokens[1])
            let removeResolve;
            const removeCall = new Promise<IBook[]>(r => { removeResolve = r })

            socket.on('message', ev => {
                const {channel, namespace, data} = JSON.parse(ev.toString())
                if (myNamespace !== namespace) return
                if (channel === 'removed') return removeResolve(data)
            });

            const bookId = await utils.book.create(tokens[0], 'toBeRemoved')
            const myBook = await utils.book.get(tokens[0], bookId)
            myBook.editors.push(userIds[1])
            await utils.book.update(tokens[0], myBook)
            await utils.book.remove(tokens[0], myBook._id)
            const data = await removeCall
            t.assert.equal(data[0], bookId)
            socket.terminate()
        })

        it('should send an id to a user if they are a viewer', async(t) => {
            const socket = await utils.websocketConnect(tokens[1])
            let removeResolve;
            const removeCall = new Promise<IBook[]>(r => { removeResolve = r })

            socket.on('message', ev => {
                const {channel, namespace, data} = JSON.parse(ev.toString())
                if (myNamespace !== namespace) return
                if (channel === 'removed') return removeResolve(data)
            });

            const bookId = await utils.book.create(tokens[0], 'toBeRemoved')
            const myBook = await utils.book.get(tokens[0], bookId)
            myBook.viewers.push(userIds[1])
            await utils.book.update(tokens[0], myBook)
            await utils.book.remove(tokens[0], myBook._id)
            const data = await removeCall
            t.assert.equal(data[0], bookId)
            socket.terminate()
        })

        it('should send an id if item is no longer public', async(t) => {
            const socket = await utils.websocketConnect(tokens[1])
            let removeResolve;
            const removeCall = new Promise<IBook[]>(r => { removeResolve = r })

            socket.on('message', ev => {
                const {channel, namespace, data} = JSON.parse(ev.toString())
                if (myNamespace !== namespace) return
                if (channel === 'removed') return removeResolve(data)
            });

            const bookId = await utils.book.create(tokens[0], 'toBeRemoved')
            const myBook = await utils.book.get(tokens[0], bookId)
            myBook.isPublic = true
            await utils.book.update(tokens[0], myBook)
            await utils.book.remove(tokens[0], myBook._id)
            const data = await removeCall
            t.assert.equal(data[0], bookId)
            socket.terminate()
        })
    })
})
