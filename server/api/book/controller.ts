import { Book } from './model'
import { Page } from '../page/model'
import { Widget } from '../widget/model'
import { BookSocket } from './socket'
import * as utils from '../utils'
import { handleApiCall } from '../utils'
import * as auth from '../../auth/auth.service'




/**
 * Creates a book and sets the current user as owner
 */
export const create = handleApiCall(async(req, res) => {
    const myBook = new Book({
        name: req.body.name,
        owner: req.user._id
    })

    await myBook.validate()
    const data = await Book.create(myBook)
    BookSocket.onAddOrChange(data.toJSON())
    utils.handleNoResult(res)()
})

/**
 * Updates a book, only the owner or editors can make updates
 */
export const update = handleApiCall(async(req, res) => {
    const myId: string = req.body._id
    const myBook = new Book(req.body)
    delete req.body._id

    await myBook.validate()
    const oldBook = await Book.findById(myId).exec()
    await auth.hasEditAccess(req.user._id, oldBook)

    if (oldBook.owner !== myBook.owner && oldBook.owner !== req.user._id) {
        throw Error(`Only the owner of the book: ${oldBook._id}, can edit the owner field.`)
    }

    await Book.findByIdAndUpdate(myId, req.body).exec()
    BookSocket.onAddOrChange(myBook, oldBook)
    utils.handleResponseNoData(res)()
})

/**
 * Deletes a book, only the owner can do this action
 */
export const remove = handleApiCall(async(req, res) => {
    const myId: string = req.params.id

    const myBook = await Book.findById(myId).exec()
    await auth.hasOwnerAccess(req.user._id, myBook)
    // Delete all pages
    const pages = await Page.find({ bookId: myId }).exec()
    await Promise.all(pages.map(p => Widget.deleteMany({ pageId: p._id }).exec()))
    await Page.deleteMany({ bookId: myId }).exec()
    // Delete book
    await myBook.deleteOne()
    BookSocket.onDelete(myBook)
    utils.handleResponseNoData(res)()
})

/**
 * Returns all the books the user can access
 */
export const getMyBooks = handleApiCall(async(req, res) => {
    const userId: string = req.user._id
    const books = await Book.find({
        $or: [{
            owner: userId
        }, {
            editors: userId
        }, {
            viewers: userId
        }, {
            isPublic: true
        }]
    }).exec()
    utils.handleResponse(res)(books.map(x => x.toJSON()))
})

/**
 * Get book if user has at least read access
 */
export const getBook = handleApiCall(async(req, res) => {
    const bookId: string = req.params.id
    const myBook = await Book.findById(bookId).exec()
    await auth.hasViewerAccess(req.user._id, myBook)
    utils.handleResponse(res)(myBook.toJSON())
})