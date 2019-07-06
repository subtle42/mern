import * as passport from 'passport'
import { Strategy } from 'passport-google-oauth20'
import { NextFunction, Request, Response } from 'express'
import { User } from '../../api/user/model'
import { signToken } from '../auth.service'
import * as fs from 'fs'

interface GoogleConfig {
    web: {
        client_id: string
        project_id: string
        auth_uri: string
        token_uri: string
        client_secret: string
        redirect_uris: string[]
        javascript_origins: string[]
    }
}

const googleConfig: GoogleConfig = JSON.parse(fs.readFileSync('./server/config/google.json') as any)

passport.use(new Strategy({
    clientID: googleConfig.web.client_id,
    clientSecret: googleConfig.web.client_secret,
    callbackURL: '/auth/google/redirect'
}, (accessToken, refreshToken, profile, done) => {
    User.findOne({
        email: profile.emails[0].value
    })
    .then(user => {
        if (user) return user
        return User.create(new User({
            email: profile.emails[0].value,
            provider: 'google',
            name: profile.id
        }))
    })
    .then(user => done(undefined, user))
    .catch(err => done(err, undefined))
}))

export const login = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('google', (err, user) => {
        if (err) {
            return res.status(401).json(err)
        }
        if (!user) {
            return res.status(404).json({
                message: 'Something went wrong, please try again.'
            })
        }
        let token = signToken(user._id, user.role)
        res.json({ token })
    })(req, res, next)
}
