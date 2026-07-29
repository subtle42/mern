import { IPage, Page } from './model'
import { Book } from '../book/model'
import { getPageSocket } from './socket'
import { Widget } from '../widget/model'
import { FastifyReply, FastifyRequest } from 'fastify'

/**
 * Creates a page as part of a book
 */
export const create = async(
    req: FastifyRequest<{Body: Omit<IPage, '_id'>}>,
    res: FastifyReply<{Reply: string}>
) => {
    const myBook = await Book.findById(req.body.bookId).exec()
    myBook.hasEditAccess(req.user._id)
    const newPage = await Page.create(req.body)
    getPageSocket().onAddOrChange(newPage.bookId, [newPage])
    res.send(newPage._id.toString())
}

/**
 * Updates a page if user has edit access
 */
export const update = async(
    req: FastifyRequest<{Body: IPage}>,
    res: FastifyReply<{Reply: void}>
) => {
    let myId: string = req.body._id
    let myPage = new Page(req.body)
    delete req.body._id
    const toUpdatePage = await Page.findById(myId).exec()
    const toUpdateBook = await Book.findById(toUpdatePage.bookId).exec()
    toUpdateBook.hasEditAccess(req.user._id)
    await Page.findByIdAndUpdate(myId, myPage).exec()
    getPageSocket().onAddOrChange(myPage.bookId, [myPage])
    res.send()
}

/**
 * Removes a page if user has book edit access
 */
export const remove = async(
    req: FastifyRequest<{Params: {id: string}}>,
    res: FastifyReply
) => {
    const myId: string = req.params.id

    const myPage = await Page.findById(myId)
    const myBook = await Book.findById(myPage.bookId).exec()
    myBook.hasEditAccess(req.user._id)
    await Widget.deleteMany({ pageId: myId }).exec()
    await myPage.deleteOne()
    getPageSocket().onDelete(myPage.bookId, [myPage._id.toString()])
    res.send()
}

export const getPages = async(
    req: FastifyRequest<{Params: {bookId: string}}>,
    res: FastifyReply<{Reply: IPage[]}>
) => {
    const bookId: string = req.params.bookId
    const myBook = await Book.findById(bookId).exec()
    myBook.hasViewerAccess(req.user._id)
    const pageRes = await Page.find({ bookId }).exec()
    res.send(pageRes.map(x => {
        return {...x.toJSON(), _id: x._id.toString()}
    }))
}
