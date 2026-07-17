import { IWidget, Widget, WidgetDoc } from './model'
import BaseSocket from '../../sockets/sockets'
import { Book } from '../book/model'
import { Page } from '../page/model'
import { FastifyInstance } from 'fastify'

let tmp: WidgetSocket
export const buildWidgetSocket = (app: FastifyInstance) => {
    tmp = new WidgetSocket(app)
}

export const getWidgetSocket = () => {
    if (!tmp) throw Error(`Asked too soon for Widget Socket`)
    return tmp
}

class WidgetSocket extends BaseSocket {
    constructor (app: FastifyInstance) {
        super(app, 'widgets')
    }

    getParentId (model) {
        return model.pageId
    }

    getInitialState (pageId: string) {
        return Widget.find({
            pageId
        }).exec()
    }

    getSharedModel (pageId: string) {
        return Page.findById(pageId).exec()
        .then(page => Book.findById(page.bookId).exec())
    }

    onManyAdd (models: WidgetDoc[]) {
        this._onAddOrChange(this.getParentId(models[0]), models)
    }

    onAddOrChange (model: WidgetDoc) {
        this._onAddOrChange(this.getParentId(model), [model])
    }

    onDelete (model: Partial<IWidget>) {
        this._onDelete(this.getParentId(model), [model._id])
    }
}

