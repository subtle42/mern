import { Router } from 'express'
import * as multer from 'multer'
import { controller } from './controller'
import { isAuthenticated } from '../../auth/auth.service'

let router = Router()

router.get('/:id', isAuthenticated, controller.getSource)
router.get('/', isAuthenticated, controller.getMySources)
router.post('/', isAuthenticated, multer({ dest: './.uploads' }).single('file'), (req, res) => controller.create(req, res))
router.put('/', isAuthenticated, controller.update)
router.delete('/:id', isAuthenticated, controller.remove)
router.post('/query', isAuthenticated, (res, req) => controller.query(res, req))

module.exports = router
