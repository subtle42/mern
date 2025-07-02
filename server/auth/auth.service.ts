import config from '../config/environment'
import { Request, Response, NextFunction } from 'express'
import * as jwt from 'jsonwebtoken'
import { IShared } from 'common/models'
import { Document } from 'mongoose'


declare global {
    namespace Express {
        interface User {
            _id: string
            role: string
        }
        interface Request {
            user?: User | undefined;
        }
    }
}

/**
 * Checks if user is logged in.
 * @param req
 * @param res
 * @param next
 */
export function isAuthenticated (req: Request, res: Response, next: NextFunction): void {
    let token = req.headers['authorization'] || req.body.token
    if (!token) {
        res.status(401).send({
            message: 'No token provided'
        }).end()
        return
    }
    jwt.verify(token, config.shared.secret, (err, decoded) => {
        if (err) return res.status(401).send('Failed to authenticate token')
        req.user = decoded
        next()
    })
}

/**
 * Checks if user has owner access to specific resource before CRUD operation.
 * @param userId
 * @param book
 */
export const hasOwnerAccess = (userId: string, myModel: Document<unknown, {}, IShared>): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (myModel.get('owner') === userId) return resolve()
        return reject(`User does not have owner access to shareModel: ${myModel._id}`)
    })
}

/**
 * Checks if user has owner access to specific resource before CRUD operation.
 * @param userId
 * @param book
 */
export const hasEditAccess = (userId: string, myModel: Document<unknown, {}, IShared>): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (myModel.get('owner') === userId) return resolve()
        if (myModel.get('editors').includes(userId)) return resolve()
        return reject(`User does not have owner access to book: ${myModel._id}`)
    })
}

/**
 * Checks if user has owner access to specific resource before CRUD operation.
 * @param userId
 * @param book
 */
export const hasViewerAccess = (userId: string, myModel: Document<unknown, {}, IShared>): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (myModel.get('isPublic')) return resolve()
        if (myModel.get('owner') === userId) return resolve()
        if (myModel.get('editors').includes(userId)) return resolve()
        if (myModel.get('viewers').includes(userId)) return resolve()
        return reject(`User does NOT have owner access to item: ${myModel._id}`)
    })
}

/**
 * Checks if the user role is admin
 * @param req
 * @param res
 * @param next
 */
export function isAdmin (req: Request, res: Response, next: NextFunction) {
    let user = req.user
    if (!user) {
        res.status(403).send('Your JWT has not been checked').end()
    } else if (user.role !== 'admin') {
        res.status(403).send(`You are not an ADMIN. Your access is: ${user.role}`).end()
    } else {
        next()
    }
}

export function signRequest (req: Request): string {
    const user: any = req.user
    const tmp = { _id: user.id, role: user.role }
    const token = jwt.sign(tmp, config.shared.secret, {
        expiresIn: 60 * 60 * 5
    })
    return token
}
