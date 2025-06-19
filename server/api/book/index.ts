import { Router } from 'express'
import ctrl from './controller'
import * as auth from '../../auth/auth.service'

const router = Router()

router.get('/:id', auth.isAuthenticated, ctrl.getBook)
router.get('/', auth.isAuthenticated, ctrl.getMyBooks)
router.post('/', auth.isAuthenticated, ctrl.create)
router.delete('/:id', auth.isAuthenticated, ctrl.remove)
router.put('/', auth.isAuthenticated, ctrl.update)

export const BookRouter = router
