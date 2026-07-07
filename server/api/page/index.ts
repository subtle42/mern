import * as ctrl from './controller'
import { FastifyInstance } from 'fastify'
import { isAuthenticated } from '../../auth/auth.service'
import { pageSchema } from './model'



export const buildPageApis = (app: FastifyInstance) => {
    app.log.info('buidling page apis...')

    app.get('/:bookId', {
        preHandler: [isAuthenticated],
        schema: {
            tags: ['Pages'],
            params: {
                type: 'object',
                properties: {
                    bookId: {type: 'string'}
                }
            },
            response: {
                200: {
                    type: 'array',
                    items: pageSchema.toJSONSchema()
                }
            }
        }
    }, ctrl.getPages)

    app.post('', {
        preHandler: [isAuthenticated],
        schema: {
            tags: ['Pages'],
            body: {
                type: 'object',
                properties: {
                    name: {type: 'string'},
                    bookId: {type: 'string'}
                }
            },
            response: {
                200: {}
            }
        }
    }, ctrl.create)

    app.delete('/:id', {
        onRequest: [isAuthenticated],
        schema: {
            tags: ['Pages'],
            params: {
                type: 'object',
                properties: {
                    id: {type:'string'}
                }
            }
        }
    }, ctrl.remove)

    app.put('', {
        onRequest: [isAuthenticated],
        schema: {
            tags: ['Pages'],
            body: pageSchema.toJSONSchema(),
            response: {
                200: {}
            }
        }
    }, ctrl.update)

    app.log.info('done')
}