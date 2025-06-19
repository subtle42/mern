import { Request, Response } from 'express'
import { Page } from './model'
import { Book } from '../book/model'
import * as utils from '../utils'
import { pageSocket } from './socket'
import * as auth from '../../auth/auth.service'
import { Widget } from '../widget/model'

/**
 * Creates a page as part of a book
 */
export const create = utils.handleApiCall(async(req, res) => {
    const myBook = await Book.findById(req.body.bookId).exec()
    await auth.hasEditAccess(req.user._id, myBook)
    const newPage = await Page.create(req.body)
    pageSocket.onAddOrChange(newPage)
    utils.handleResponse(res)(newPage._id)
})

/**
 * Updates a page if user has edit access
 */
export const update = utils.handleApiCall(async(req, res) => {
    let myId: string = req.body._id
    let myPage = new Page(req.body)
    delete req.body._id
    
    const toUpdatePage = await Page.findById(myId).exec()
    await Book.find().getPageParent(toUpdatePage)
    const toUpdateBook = await Book.findById(toUpdatePage._id).exec()
    await auth.hasEditAccess(req.user._id, toUpdateBook)
    await Page.findByIdAndUpdate(myId, myPage).exec()
    pageSocket.onAddOrChange(myPage)
    utils.handleResponseNoData(res)()
})

/**
 * Removes a page if user has book edit access
 */
export const remove = utils.handleApiCall(async(req, res) => {
    const myId: string = req.params.id

    const myPage = await Page.findById(myId)
    const myBook = await Book.findById(myPage.bookId).exec()
    await auth.hasEditAccess(req.user._id, myBook)

    await Widget.deleteMany({ pageId: myId }).exec()
    await myPage.deleteOne()
    pageSocket.onDelete(myPage)

    utils.handleResponseNoData(res)()
})

export const getPages = utils.handleApiCall(async(req: Request, res: Response) => {
    const bookId: string = req.params.id
    const myBook = await Book.findById(bookId).exec()
    await auth.hasViewerAccess(req.user._id, myBook)
    const pageRes = await Page.find({ bookId }).exec()
    utils.handleResponse(res)(pageRes.map(x => x.toJSON()))
})
