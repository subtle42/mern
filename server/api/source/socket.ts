import { Source } from './model'
import { AclSocket } from '../../sockets/aclSocket'

export const SourceSocket = new AclSocket('sources', Source)
