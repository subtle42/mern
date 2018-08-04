import { Book } from './model'
import { AclSocket } from '../../sockets/aclSocket'

export const BookSocket = new AclSocket('books', Book)
