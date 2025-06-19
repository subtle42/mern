import { Request, Response } from 'express'
import { Page } from './model'
import { Book } from '../book/model'
import * as utils from '../utils'
import { pageSocket } from './socket'
import * as auth from '../../auth/auth.service'
import { Widget } from '../widget/model'

export default class PageController {
    /**
     * Creates a page as part of a book
     * @param req
     * @param res
     */
    public static async create (req: Request, res: Response) {
        try {
            const myBook = await Book.findById(req.body.bookId).exec()
            await auth.hasEditAccess(req.user._id, myBook)
            const newPage = await Page.create(req.body)
            pageSocket.onAddOrChange(newPage)
            res.json(newPage._id)
        }
        catch(err) {
            utils.handleError(err)
        }
        // myPage.validate()
        // .then(() => Book.findById(myPage.bookId).exec())
        // .then(book => auth.hasEditAccess(req.user._id, book))
        // .then(() => Page.create(myPage))
        // .then(page => {
        //     pageSocket.onAddOrChange(page)
        //     return page._id
        // })
        // .then(utils.handleResponse(res))
        // .catch(utils.handleError(res))
    }

    /**
     * Updates a page if user has edit access
     * @param req
     * @param res
     */
    public static async update (req: Request, res: Response) {
        let myId: string = req.body._id
        let myPage = new Page(req.body)
        delete req.body._id
        try {
            const toUpdatePage = await Page.findById(myId).exec()
            const asdf = await Book.find().getPageParent(toUpdatePage)
            const toUpdateBook = await Book.findById(toUpdatePage._id).exec()
            await auth.hasEditAccess(req.user._id, toUpdateBook)
            await Page.findByIdAndUpdate(myId, myPage).exec()
            pageSocket.onAddOrChange(myPage)
            res.json()
        }
        catch(err) {
            res.status(500).json({err})
        }

        // myPage.validate()
        // .then(() => Page.findById(myId).exec())
        // .then(page => {
        //     return Book.findById(page.bookId).exec()
        //     .then(book => auth.hasEditAccess(req.user._id, book))
        //     .then(() => Page.findByIdAndUpdate(myId, myPage).exec())
        // })
        // .then(() => pageSocket.onAddOrChange(myPage))
        // .then(utils.handleResponseNoData(res))
        // .catch(utils.handleError(res))
    }

    /**
     * Removes a page if user has book edit access
     * @param req
     * @param res
     */
    public static remove (req: Request, res: Response): void {
        let myId: string = req.params.id

        Page.findById(myId)
        .then(page => {
            return Book.findById(page.bookId).exec()
            .then(book => auth.hasEditAccess(req.user._id, book))
            .then(() => Widget.deleteMany({
                pageId: myId
            }).exec())
            .then(() => page.deleteOne())
            .then(() => pageSocket.onDelete(page))
        })
        .then(utils.handleResponseNoData(res))
        .catch(utils.handleError(res))
    }

    public static getPages (req: Request, res: Response): void {
        const bookId: string = req.params.id
        Book.findById(bookId).exec()
        .then(book => auth.hasViewerAccess(req.user._id, book))
        .then(() => Page.find({ bookId }).exec())
        .then(utils.handleResponse(res))
        .catch(utils.handleError(res))
    }
}
