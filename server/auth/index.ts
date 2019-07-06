import * as express from 'express'
import { User } from '../api/user/model'
import local from './local/passport'
import * as passport from 'passport'
import * as GoogleAuth from './google/passport'

local.setup(User)
const router = express.Router()

router.post('/local', local.authenticate)
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}))
router.get('/google/redirect', GoogleAuth.login)
router.get('/logout', (req, res) => {
    req.logOut()
    res.send()
})

module.exports = router
