import { Router } from 'express'
import controller from './controller'
import * as auth from '../../auth/auth.service'

let router = Router()

router.get('/:id', auth.isAuthenticated, controller.getPages)
router.post('/', auth.isAuthenticated, controller.create)
router.delete('/:id', auth.isAuthenticated, controller.remove)
router.put('/', auth.isAuthenticated, controller.update)

module.exports = router
