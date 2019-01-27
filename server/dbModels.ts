import * as myModels from 'common/models'
import { Document } from 'mongoose'
import { Request } from 'express'

export interface MyRequest extends Request {
    user: {
        role: string,
        _id: string
    }
}

interface IUserDb extends myModels.IUser {
    password: string
    role: string
    provider: string
    salt: string
    token: {
        role: string,
        _id: string
    }
    profile: {
        role: string,
        name: string
    }
    authenticate (password: string): Promise<void>
    makeSalt (byteSize?: number): Promise<string>
    encryptPassword (password: string): Promise<string>
}

export interface ISharedModel extends myModels.IShared, Document {}
export interface IUserModel extends IUserDb, Document {}
export interface IOfferModel extends myModels.IOffer, Document {}