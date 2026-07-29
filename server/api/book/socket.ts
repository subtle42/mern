import { Book } from './model'
import { WsAclSocket } from '../../sockets/aclSocket'
import { FastifyInstance } from 'fastify'

let tmp: WsAclSocket
export const buildBookSocket = (server: FastifyInstance) => {
    tmp = new WsAclSocket(server, 'books', Book as any)
}

export const getBookSocket = () => {
    if (!tmp) throw Error(`Asked too soon for Book Socket`)
    return tmp
}
