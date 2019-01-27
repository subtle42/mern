import { Router } from 'express'
import { UserController as controller } from './controller'
import * as auth from '../../auth/auth.service'

const router = Router()

router.get('/', auth.isAuthenticated, auth.isAdmin, controller.getAll)
router.get('/:id', auth.isAuthenticated, auth.isAdmin, controller.getOne)
router.delete('/:id', auth.isAuthenticated, auth.isAdmin, controller.destroy)
router.put('/:id', auth.isAuthenticated, auth.isAdmin, controller.update)
router.post('/', auth.isAuthenticated, auth.isAdmin, controller.create)

module.exports = router
