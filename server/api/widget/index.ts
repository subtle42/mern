import * as ctrl from './controller'
// import * as auth from '../../auth/auth.service'
import { FastifyInstance } from 'fastify'
import { isAuthenticated } from 'server/auth/auth.service'


export const buildWidgetApis = (app: FastifyInstance) => {
    app.post('/', {
        onRequest: [isAuthenticated]
    }, ctrl.create)

    app.post('/multiple', {
        onRequest: [isAuthenticated]
    }, ctrl.createMultiple)

    app.delete('/:id/:pageId/:bookId', {
        onRequest: [isAuthenticated]
    }, ctrl.remove)

    app.put('/', {
        onRequest: [isAuthenticated]
    }, ctrl.update)

    app.get('/:id', {
        onRequest: [isAuthenticated]
    }, ctrl.get)
}
