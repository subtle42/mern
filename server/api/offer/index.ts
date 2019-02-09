import { Router } from 'express'
import { UserController as controller } from './controller'
import * as auth from '../../auth/auth.service'

const router = Router()

router.get('/', auth.isAuthenticated, controller.getAll)
router.get('/:id', auth.isAuthenticated, controller.getOne)
router.delete('/:id', auth.isAuthenticated, auth.isAdmin, controller.destroy)
router.put('/:id', auth.isAuthenticated, controller.update)
router.post('/', auth.isAuthenticated, controller.create)

module.exports = router
