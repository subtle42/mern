import { Router } from 'express'
import * as controller from './controller'
import * as auth from '../../auth/auth.service'

let router = Router()

router.post('/', auth.isAuthenticated, controller.create)
router.post('/multiple', auth.isAuthenticated, controller.createMultiple)
router.delete('/:id/:pageId/:bookId', auth.isAuthenticated, controller.remove)
router.put('/', auth.isAuthenticated, controller.update)
router.get('/:id', auth.isAuthenticated, controller.get)

module.exports = router
