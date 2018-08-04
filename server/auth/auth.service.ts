import config from '../config/environment'
import { Request, Response, NextFunction } from 'express'
import * as jwt from 'jsonwebtoken'
import { IBookModel, ISharedModel } from '../dbModels'

interface MyRequest extends Request {
    user?: {
        role: string,
        _id: string
    }
}

/**
 * Checks if user is logged in.
 * @param req
 * @param res
 * @param next
 */
export function isAuthenticated (req: MyRequest, res: Response, next: NextFunction): void {
    let token = req.body.token || req.query.token || req.headers['authorization']
    if (!token) {
        return res.status(401).send({
            message: 'No token provided'
        }).end()
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
export const hasOwnerAccess = (userId: string, myModel: ISharedModel): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (myModel.owner === userId) return resolve()
        return reject(`User does not have owner access to shareModel: ${myModel._id}`)
    })
}

/**
 * Checks if user has owner access to specific resource before CRUD operation.
 * @param userId
 * @param book
 */
export const hasEditAccess = (userId: string, myModel: ISharedModel): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (myModel.owner === userId) return resolve()
        if (myModel.editors.indexOf(userId) !== -1) return resolve()
        return reject(`User does not have owner access to book: ${myModel._id}`)
    })
}

/**
 * Checks if user has owner access to specific resource before CRUD operation.
 * @param userId
 * @param book
 */
export const hasViewerAccess = (userId: string, myModel: ISharedModel): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (myModel.isPublic) return resolve()
        if (myModel.owner === userId) return resolve()
        if (myModel.editors.indexOf(userId) !== -1) return resolve()
        if (myModel.viewers.indexOf(userId) !== -1) return resolve()
        return reject(`User does NOT have owner access to item: ${myModel._id}`)
    })
}

/**
 * Checks if the user role is admin
 * @param req
 * @param res
 * @param next
 */
export function isAdmin (req: MyRequest, res: Response, next: NextFunction) {
    let user = req.user
    if (!user) {
        res.status(403).send('Your JWT has not been checked').end()
    } else if (user.role !== 'admin') {
        res.status(403).send(`You are not an ADMIN. Your access is: ${user.role}`).end()
    } else {
        next()
    }
}

/**
 * Returns a jwt token signed by the app secret
 * @param id
 * @param role
 */
export function signToken (id, role): string {
    let tmp = { _id: id, role: role }
    return jwt.sign(tmp, config.shared.secret, {
        expiresIn: 60 * 60 * 5
    })
}

/**
 * Set token cookie directly for oAuth strategies
 * @param req
 * @param res
 */
export function setTokenCookie (req, res) {
    if (!req.user) {
        return res.status(404).send('It looks like you aren\'t logged in, please try again.')
    }
    let token = signToken(req.user._id, req.user.role)
    res.cookie('token', token)
    res.redirect('/')
}
