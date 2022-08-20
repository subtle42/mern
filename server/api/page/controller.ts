import { Request, Response } from 'express'
import { Page } from './model'
import { Book } from '../book/model'
import * as utils from '../utils'
import { pageSocket } from './socket'
import * as auth from '../../auth/auth.service'
import { Widget } from '../widget/model'
import { MyRequest } from 'server/dbModels'

export default class PageController {
    /**
     * Creates a page as part of a book
     * @param req
     * @param res
     */
    public static create (req: MyRequest, res: Response): void {
        let myPage = new Page({
            name: req.body.name,
            bookId: req.body.bookId
        })

        myPage.validate()
        .then(() => Book.findById(myPage.bookId).exec())
        .then(book => auth.hasEditAccess(req.user._id, book))
        .then(() => Page.create(myPage))
        .then(page => {
            pageSocket.onAddOrChange(page)
            return page._id
        })
        .then(utils.handleResponse(res))
        .catch(utils.handleError(res))
    }

    /**
     * Updates a page if user has edit access
     * @param req
     * @param res
     */
    public static update (req: MyRequest, res: Response): void {
        let myId: string = req.body._id
        let myPage = new Page(req.body)
        delete req.body._id

        myPage.validate()
        .then(() => Page.findById(myId).exec())
        .then(page => {
            return Book.findById(page.bookId).exec()
            .then(book => auth.hasEditAccess(req.user._id, book))
            .then(() => Page.findByIdAndUpdate(myId, myPage).exec())
        })
        .then(() => pageSocket.onAddOrChange(myPage))
        .then(utils.handleResponseNoData(res))
        .catch(utils.handleError(res))
    }

    /**
     * Removes a page if user has book edit access
     * @param req
     * @param res
     */
    public static remove (req: MyRequest, res: Response): void {
        let myId: string = req.params.id

        Page.findById(myId)
        .then(page => {
            return Book.findById(page.bookId).exec()
            .then(book => auth.hasEditAccess(req.user._id, book))
            .then(() => Widget.remove({
                pageId: myId
            }).exec())
            .then(() => page.remove())
            .then(() => pageSocket.onDelete(page))
        })
        .then(utils.handleResponseNoData(res))
        .catch(utils.handleError(res))
    }

    public static getPages (req: MyRequest, res: Response): void {
        const bookId: string = req.params.id
        Book.findById(bookId).exec()
        .then(book => auth.hasViewerAccess(req.user._id, book))
        .then(() => Page.find({ bookId }).exec())
        .then(utils.handleResponse(res))
        .catch(utils.handleError(res))
    }
}
