import { Source } from './model'
import { AclSocket } from '../../sockets/aclSocket'
import { FastifyInstance } from 'fastify'


let tmp: AclSocket
export const buildSourceSocket = (server: FastifyInstance) => {
    tmp = new AclSocket(server, 'sources', Source as any)
}

export const getSourceSocket = () => {
    if (!tmp) throw Error(`Asked too soon for Source Socket`)
    return tmp
}
