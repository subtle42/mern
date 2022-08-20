import * as crypto from 'crypto'
import * as mongoose from 'mongoose'
import { IUserModel } from '../../dbModels'
import { createSchema } from '../utils'

const authTypes = ['github', 'twitter', 'facebook', 'google']

let UserSchema = new mongoose.Schema({
    name: { required: true, type: String },
    email: {lowercase: true, type: String, required () {
        if (authTypes.indexOf(this.provider) === -1) {
            return true
        } else {
            return false
        }
    }},
    password: {type: String, required () {
        if (authTypes.indexOf(this.provider) === -1) {
            return true
        } else {
            return false
        }
    }},
    role: { type: String, default: 'user', required: true },
    provider: { type: String, required: true },
    salt: String,
    facebook: {},
    google: {}
})

/**
 * Virtuals
 */

// Public profile information
UserSchema
.virtual('profile')
.get(() => {
    return {
        name: (this as any).name,
        role: (this as any).role
    }
})
// Non-sensitive info we'll be putting in the token
UserSchema
.virtual('token')
.get(() => {
    return {
        _id: (this as any)._id,
        role: (this as any).role
    }
})

/**
 * Validations
 */

// Validate empty email
UserSchema
.path('email')
.validate((email: string) => {
    if (authTypes.indexOf((this as any).provider) !== -1) {
        return true
    }
    return email.length

}, 'Email cannot be blank')
// Need to use
.validate(function (email: string/*, respond:Function*/) {
    return new Promise((resolve, reject) => {
        if (authTypes.indexOf(this.provider) !== -1) {
            return resolve(this)
        }
        this.constructor.findOne({ email: email })
        .then(user => {
            if (!user) {
                resolve(this)
            } else {
                reject('This email address is already taken')
            }
        })
    })
})

UserSchema
.path('password')
.validate((password: string) => {
    if (authTypes.indexOf((this as any).provider) !== -1) {
        return true
    }
    return password.length
}, 'Password cannot be blank')

UserSchema.methods = {
    authenticate (password: string): Promise<string> {
        return new Promise((resolve, reject) => {
            (this as any).encryptPassword(password)
            .then(pwdGen => {
                if ((this as any).password === pwdGen) {
                    resolve((this as any))
                } else {
                    reject('Incorrect password.')
                }
            })
        })
    },
    makeSalt (byteSize?: number): Promise<string> {
        return new Promise((resolve, reject) => {
            byteSize = byteSize || 16

            crypto.randomBytes(byteSize, (err, salt) => {
                if (err) return reject(err)
                resolve(salt.toString('base64'))
            })
        })
    },
    encryptPassword (password: string): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!password || !(this as any).salt) {
                return reject('Missing password or salt')
            }

            const defaultIterations = 10000
            const defaultKeyLength = 64
            const salt = new Buffer((this as any).salt, 'base64')
            const digest = 'sha512'

            crypto.pbkdf2(password, salt, defaultIterations, defaultKeyLength, digest, (err, key) => {
                if (err) return reject(err)
                resolve(key.toString('base64'))
            })
        })
    }
}

// Helps with integration testing
export const User: mongoose.Model<IUserModel> = createSchema('User', UserSchema)
