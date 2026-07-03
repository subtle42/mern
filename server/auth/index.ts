import { isAuthenticated } from './auth.service'

import { FastifyInstance } from 'fastify'
import jwt from '@fastify/jwt'
import config from '../config/environment'
import { User } from 'server/api/user/model'

declare module '@fastify/jwt' {
    interface FastifyJWT {
        user: {
            _id: string;
            role: string;
        }
    }
}

export const buildJwt = (app: FastifyInstance) => {
    app.register(jwt, {
        secret: config.shared.secret
    })
}

export const buildAuthApis = (app: FastifyInstance) => {
    app.post<{
        Body: {email:string, password:string},
    }>('/local', {
        onError: (req, res, err) => {
            console.error(err)
            res.status(401).send({message: err})
        }
    }, async(req, res) => {
        const {email, password} = req.body
        const user = await User.findOne({email})

        if (!user) throw new Error('This email is not registered')
        await user.authenticate(password)

        res.send({
            token: app.jwt.sign({
                _id: user._id,
                role: user.role
            })
        })
    })

    app.get('/logout', {
        onRequest: [isAuthenticated]
    }, (req, res) => {
        res.send({message: 'destory'})
    })
}