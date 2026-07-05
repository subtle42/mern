import { Book } from './model'
import { AclSocket } from '../../sockets/aclSocket'
import { FastifyInstance } from 'fastify'

let tmp: AclSocket
export const buildBookSocket = (server: FastifyInstance) => {
    tmp = new AclSocket(server, 'books', Book as any)
}

export const getBookSocket = () => {
    if (!tmp) throw Error(`Asked too soon for Book Socket`)
    return tmp
}
