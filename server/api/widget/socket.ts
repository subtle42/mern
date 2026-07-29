import { IWidget, Widget } from './model'
import { WsBaseSocket } from '../../sockets/sockets'
import { Book } from '../book/model'
import { Page } from '../page/model'
import { FastifyInstance } from 'fastify'


let tmp: WsWidgetSocket
export const buildWidgetSocket = (app: FastifyInstance) => {
    if (tmp) return tmp
    tmp = new WsWidgetSocket(app)
    return tmp
}

export const getWidgetSocket = () => {
    if (!tmp) throw Error(`Asked too soon for Page Socket`)
    return tmp
}


class WsWidgetSocket extends WsBaseSocket<IWidget> {
    constructor(server: FastifyInstance) {
        super(server, 'widgets')
    }

    getInitState(id: string) {
        return Widget.find({pageId: id}).exec()
    }

    async getBook(id: string) {
        const myPage = await Page.findById(id).exec()
        return Book.findById(myPage.bookId).exec()
    }
}