import * as passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { User } from '../api/user/model'
import { Strategy } from 'passport-google-oauth20'
import { readFileSync } from 'fs'

passport.serializeUser((user, cb) => {
    cb(null, user)
})

passport.deserializeUser((obj, cb) => {
    cb(null, obj)
})

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

const googleConfig: GoogleConfig = JSON.parse(readFileSync('./server/config/google.json') as any)

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

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, (email, password, done) => {
    User.findOne({
        email: email.toLocaleLowerCase()
    })
    .then(user => {
        if (!user) return Promise.reject({ message: 'This email is not registered' })
        return user.authenticate(password)
    })
    .then(user => done(null, user))
    .catch(err => done(err, false, { message: err }))
}))
