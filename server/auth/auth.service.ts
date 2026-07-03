import { IShared } from 'common/models'
import { Document } from 'mongoose'
import { FastifyReply, FastifyRequest } from 'fastify'


/**
 * Checks if user is logged in.
 */
export const isAuthenticated = async(req: FastifyRequest, res: FastifyReply) => {
    try {
        req.jwtVerify()
    }
    catch (err) {
        console.error(`Unable to verify token`, err)
        res.status(401).send({ error: 'Unauthorized: Invalid or missing token' });
    }
}

/**
 * Checks if user has owner access to specific resource before CRUD operation.
 */
export const hasOwnerAccess = (userId: string, myModel: Document<unknown, {}, IShared>): boolean => {
    if (myModel.get('owner') === userId) return
    return false
}


/**
 * Checks if user has owner access to specific resource before CRUD operation.
 */
export const hasEditAccess = (userId: string, myModel: Document<unknown, {}, IShared>): boolean => {
    if (myModel.get('owner') === userId) return true
    if (myModel.get('editors').includes(userId)) return true
    return false
}

/**
 * Checks if user has owner access to specific resource before CRUD operation.
 */
export const hasViewerAccess = (userId: string, myModel: Document<unknown, {}, IShared>): boolean => {
    if (myModel.get('isPublic')) return true
    if (myModel.get('owner') === userId) return true
    if (myModel.get('editors').includes(userId)) return true
    if (myModel.get('viewers').includes(userId)) return true
    return false
}

/**
 * Checks if the user role is admin
 */
export const isAdmin = async(req: FastifyRequest, res: FastifyReply) => {
    let user = req.user as any
    if (!user) {
        res.status(403).send('Your JWT has not been checked')
    } else if (user.role !== 'admin') {
        res.status(403).send(`You are not an ADMIN. Your access is: ${user.role}`)
    }
}
