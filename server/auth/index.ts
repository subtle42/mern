import './passport'
import { Router } from 'express'
import * as passport from 'passport'
import { Server } from 'socket.io'
import { signRequest } from './auth.service'

const router = Router()

router.post('/local', passport.authenticate('local'), (req, res) => {
    res.json({
        token: signRequest(req)
    })
})
router.get('/google', (req: any, res, next) => {
    req.session.socketId = req.query.socketId
    next()
}, passport.authenticate('google', {
    scope: ['profile', 'email']
}))
router.get('/google/redirect', passport.authenticate('google', {
    scope: ['profile', 'email']
}), (req, res) => {
    const myIO: Server = (global as any).myIO
    const token: string = signRequest(req)
    myIO.in((req.session as any).socketId).emit('auth', token)
    res.end()
})
router.get('/logout', (req, res) => {
    req.logOut()
    res.send()
})

module.exports = router
