// import { IPageModel } from '../../dbModels'
import { Page } from './model'
import { Book } from '../book/model'
import { Document, InferRawDocType } from 'mongoose'
import BaseSocket from '../../sockets/sockets'

class PageSocket extends BaseSocket {
    constructor () {
        super('pages')
    }

    getParentId (doc) {
        return doc.bookId
    }

    getInitialState (bookId: string) {
        return Page.find({
            bookId
        }).exec()
    }

    getSharedModel (bookId: string) {
        return Book.findById(bookId).exec()
    }

    onAddOrChange (model) {
        this._onAddOrChange(this.getParentId(model), [model])
    }

    onDelete (model) {
        this._onDelete(this.getParentId(model), [model._id])
    }
}

export const pageSocket = new PageSocket()
