import * as ctrl from './controller'
// import * as auth from '../../auth/auth.service'
import { FastifyInstance } from 'fastify'
import { isAuthenticated } from '../../auth/auth.service'


export const buildWidgetApis = (app: FastifyInstance) => {
    app.log.info('building widget apis...')

    app.post('', {
        onRequest: [isAuthenticated],
        schema: {
            tags: ['Widget']
        }
    }, ctrl.create)

    app.post('/multiple', {
        onRequest: [isAuthenticated],
        schema: {
            tags: ['Widget']
        }
    }, ctrl.createMultiple)

    app.delete('/:id/:pageId/:bookId', {
        onRequest: [isAuthenticated],
        schema: {
            tags: ['Widget']
        }
    }, ctrl.remove)

    app.put('', {
        onRequest: [isAuthenticated],
        schema: {
            tags: ['Widget']
        }
    }, ctrl.update)

    app.get('/:id', {
        onRequest: [isAuthenticated],
        schema: {
            tags: ['Widget']
        }
    }, ctrl.get)

    app.log.info('done')
}
