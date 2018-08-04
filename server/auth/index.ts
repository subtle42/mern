import * as express from 'express'
import { User } from '../api/user/model'
import local from './local/passport'

local.setup(User)
let router = express.Router()

router.post('/local', local.authenticate)
router.get('/logout', (req, res) => {
    req.logOut()
    res.send()
})

module.exports = router
