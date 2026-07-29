import { Source } from './model'
import { WsAclSocket } from '../../sockets/aclSocket'
import { FastifyInstance } from 'fastify'


let tmp: WsAclSocket
export const buildSourceSocket = (server: FastifyInstance) => {
    tmp = new WsAclSocket(server, 'sources', Source as any)
}

export const getSourceSocket = () => {
    if (!tmp) throw Error(`Asked too soon for Source Socket`)
    return tmp
}
