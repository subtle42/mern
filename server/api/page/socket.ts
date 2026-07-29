// import { IPageModel } from '../../dbModels'
import { IPage, Page } from './model'
import { Book } from '../book/model'
import { WsBaseSocket } from '../../sockets/sockets'
import { FastifyInstance } from 'fastify'


let tmp: WsPageSocket
export const buildPageSocket = (app: FastifyInstance) => {
    if (tmp) return tmp
    tmp = new WsPageSocket(app)
    return tmp
}

export const getPageSocket = () => {
    if (!tmp) throw Error(`Asked too soon for Page Socket`)
    return tmp
}


class WsPageSocket extends WsBaseSocket<IPage> {
    constructor(server: FastifyInstance) {
        super(server, 'pages')
    }

    getInitState(id: string) {
        return Page.find({bookId: id}).exec()
    }

    getBook(id: string) {
        return Book.findById(id).exec()
    }
}