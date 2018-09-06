import { Book } from './model'
import { Page } from '../page/model'
import { Widget } from '../widget/model'
import { BookSocket } from './socket'
import { Request, Response } from 'express'
import * as utils from '../utils'
import * as auth from '../../auth/auth.service'

export default class BookController {
    /**
     * Creates a book and sets the current user as owner
     * @param req
     * @param res
     */
    public static create (req: Request, res: Response): void {
        let myBook = new Book({
            name: req.body.name,
            owner: req.user._id
        })

        myBook.validate()
        .then(() => Book.create(myBook))
        .then(data => {
            BookSocket.onAddOrChange(myBook)
            return myBook
        })
        .then(utils.handleNoResult(res))
        .then(data => data._id)
        .then(utils.handleResponse(res))
        .catch(utils.handleError(res))
    }

    /**
     * Updates a book, only the owner or editors can make updates
     * @param req
     * @param res
     */
    public static update (req: Request, res: Response): void {
        let myId: string = req.body._id
        let myBook = new Book(req.body)
        delete req.body._id

        myBook.validate()
        .then(pass => Book.findById(myId).exec())
        .then(oldBook => {
            return auth.hasEditAccess(req.user._id, oldBook)
            .then(() => {
                if (oldBook.owner !== myBook.owner && oldBook.owner !== req.user._id) {
                    return Promise.reject(`Only the owner of the book: ${oldBook._id}, can edit the owner field.`)
                }
            })
            .then(() => Book.findByIdAndUpdate(myId, req.body).exec())
            .then(data => BookSocket.onAddOrChange(myBook, oldBook))
        })
        .then(utils.handleResponseNoData(res))
        .catch(utils.handleError(res))
    }

    /**
     * Deletes a book, only the owner can do this action
     * @param req
     * @param res
     */
    public static remove (req: Request, res: Response): void {
        let myId: string = req.params.id

        Book.findById(myId).exec()
        .then(book => {
            return auth.hasOwnerAccess(req.user._id, book)
            .then(() => Page.find({ bookId: myId }))
            .then(pages => Promise.all(pages.map(p => Widget.remove({ pageId: p._id }).exec())))
            .then(() => Page.remove({ bookId: myId }).exec())
            .then(() => book.remove())
            .then(() => BookSocket.onDelete(book))
        })
        .then(utils.handleResponseNoData(res))
        .catch(utils.handleError(res))
    }

    /**
     * Returns all the books the user can access
     * @param req
     * @param res
     */
    public static getMyBooks (req: Request, res: Response): void {
        let userId: string = req.user._id
        Book.find({
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
        .then(utils.handleResponse(res))
        .catch(utils.handleError(res))
    }

    /**
     * Get book if user has at least read access
     * @param req
     * @param res
     */
    public static getBook (req: Request, res: Response): void {
        const bookId: string = req.params.id
        Book.findById(bookId).exec()
        .then(book => {
            return auth.hasViewerAccess(req.user._id, book)
            .then(() => book)
        })
        .then(utils.handleResponse(res))
        .catch(utils.handleError(res))
    }
}
