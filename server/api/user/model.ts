import * as crypto from 'crypto'
import {InferSchemaType, model, Schema } from 'mongoose'

const authTypes = ['github', 'twitter', 'facebook', 'google']

let UserSchema = new Schema({
    name: { required: true, type: String },
    email: {
        lowercase: true,
        type: String,
        required () {
            return authTypes.indexOf(this.provider) === -1
        },
        validate: [{
            validator(email: string) {
                if (authTypes.indexOf(this.provider) !== -1) {
                    return true
                }
                return email.length > 0
            },
            message: 'Email cannot be blank'
        }, {
            validator(email: string) {
                return this.constructor.findOne({ email: email })
                .then(user => {
                    if (!user) return true
                    return Promise.reject('This email address is already taken')
                })
            }
        }]
    },
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
    google: {},
}, {
    virtuals: {
        profile: {
            get() {
                return {
                    name: this.name,
                    role: this.role
                }
            }
        },
        token: {
            get() {
                return {
                    _id: this._id,
                    role: this.role
                }
            }
        }
    },
    methods: {
        authenticate (password: string): Promise<string> {
            return new Promise((resolve, reject) => {
                (this as any).encryptPassword(password)
                .then(pwdGen => {
                    if (this.password === pwdGen) {
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
})


export const User = model('User', UserSchema)
export type IUser = InferSchemaType<typeof UserSchema> & {_id:any}
