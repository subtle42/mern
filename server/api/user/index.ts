import * as ctrl from './controller'
import { FastifyInstance } from 'fastify'
import { isAdmin, isAuthenticated } from 'server/auth/auth.service'


export const buildUserApis = (app: FastifyInstance) => {
    app.get('/public', {
        onRequest: [isAuthenticated]
    }, ctrl.getPublic)

    app.delete('/:id', {
        onRequest: [isAuthenticated, isAdmin]
    }, ctrl.destroy)

    app.get('/me', {
        onRequest: [isAuthenticated]
    }, ctrl.me)

    app.put('/password/change', {
        onRequest: [isAuthenticated]
    }, ctrl.changePassword)

    app.get('/profile', {
        onRequest: [isAuthenticated]
    }, ctrl.show)

    app.post('/', ctrl.create)
}