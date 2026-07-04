import * as ctrl from './controller'
import { FastifyInstance } from 'fastify'
import { isAdmin, isAuthenticated } from '../../auth/auth.service'


export const buildUserApis = (app: FastifyInstance) => {
    app.log.info('building user apis...')

    app.get('/public', {
        onRequest: [isAuthenticated],
        schema: {
            tags: ['Users']
        }
    }, ctrl.getPublic)

    app.delete('/:id', {
        onRequest: [isAuthenticated, isAdmin],
        schema: {
            tags: ['Users']
        }
    }, ctrl.destroy)

    app.get('/me', {
        onRequest: [isAuthenticated],
        schema: {
            tags: ['Users']
        }
    }, ctrl.me)

    app.put('/password/change', {
        onRequest: [isAuthenticated],
        schema: {
            tags: ['Users']
        }
    }, ctrl.changePassword)

    app.get('/profile', {
        onRequest: [isAuthenticated],
        schema: {
            tags: ['Users']
        }
    }, ctrl.show)

    app.post('', {
        schema: {
            tags: ['Users']
        }
    }, ctrl.create)

    app.log.info('done')
}