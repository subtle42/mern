import { Book, IBook } from './model'
import { Page } from '../page/model'
import { Widget } from '../widget/model'
import { getBookSocket } from './socket'
import * as auth from '../../auth/auth.service'
import { FastifyReply, FastifyRequest } from 'fastify'



/**
 * Creates a book and sets the current user as owner
 */
export const create = async(
    req: FastifyRequest<{Body: Omit<IBook, '_id'>}>,
    res: FastifyReply<{Reply: string}>
) => {
    const myBook = new Book({
        name: req.body.name,
        owner: req.user._id
    })

    await myBook.validate()
    const data = await Book.create(myBook)
    getBookSocket().onAddOrChange(data.toJSON())
    res.send(data._id.toString())
}

/**
 * Updates a book, only the owner or editors can make updates
 */
export const update = async(
    req: FastifyRequest<{Body: IBook, Reply: void}>,
    res: FastifyReply
) => {
    const myId: string = req.body._id
    const myBook = new Book(req.body)
    delete req.body._id

    await myBook.validate()
    const oldBook = await Book.findById(myId).exec()
    oldBook.hasEditAccess(req.user._id)
    if (oldBook.owner !== myBook.owner) {
        oldBook.hasOwnerAccess(req.user._id)
        // throw Error(`Only the owner of the book: ${oldBook._id}, can edit the owner field.`)
    }

    await Book.findByIdAndUpdate(myId, req.body).exec()
    getBookSocket().onAddOrChange(myBook, oldBook)
    res.send()
}

/**
 * Deletes a book, only the owner can do this action
 */
export const remove = async(
    req: FastifyRequest<{Params: {id: string}}>,
    res: FastifyReply
) => {
    const myId: string = req.params.id

    const myBook = await Book.findById(myId).exec()
    myBook.hasOwnerAccess(req.user._id)
    // Delete all pages
    const pages = await Page.find({ bookId: myId }).exec()
    await Promise.all(pages.map(p => Widget.deleteMany({ pageId: p._id }).exec()))
    await Page.deleteMany({ bookId: myId }).exec()
    // Delete book
    await myBook.deleteOne()
    getBookSocket().onDelete(myBook)
    res.send()
}

/**
 * Returns all the books the user can access
 */
export const getMyBooks = async(
    req: FastifyRequest,
    res: FastifyReply<{Reply: IBook[]}>
) => {
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
    res.send(books.map(x => {
        return {...x.toJSON(), _id: x._id.toString()}
    }))
}

/**
 * Get book if user has at least read access
 */
export const getBook = async(
    req: FastifyRequest<{Params: {id: string}, Reply: IBook}>,
    res: FastifyReply
) => {
    const bookId: string = req.params.id
        const myBook = await Book.findById(bookId).exec()
        await myBook.hasViewerAccess(req.user._id)
        res.send(myBook.toJSON() as IBook)
}