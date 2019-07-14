import './passport'
import { Router } from 'express'
import * as passport from 'passport'
import { signRequest } from './auth.service'

const router = Router()

router.post('/local', passport.authenticate('local'), signRequest)
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}))
router.get('/google/redirect', passport.authenticate('google', {
    scope: ['profile', 'email']
}), (req, res) => {
    res.send('you reached the redirect URI')
})
router.get('/logout', (req, res) => {
    req.logOut()
    res.send()
})

module.exports = router
