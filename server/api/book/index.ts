import { FastifyInstance } from 'fastify'
import { bookSchema } from './model'
import { isAuthenticated } from '../../auth/auth.service'
import * as ctrl from './controller'


export const buildBookApis = (app: FastifyInstance) => {
    app.log.info('building book apis...')
    app.addSchema({...bookSchema.toJSONSchema(), '$id': 'Book'})

    app.get('', {
        onRequest: [isAuthenticated],
        schema: {
            tags: ['Books'],
            security: [{bearerAuth: []}],
            response: {
                200: {
                    type: 'array',
                    items: {'$ref': 'Book'}
                }
            }
        }
    }, ctrl.getMyBooks)

    app.get('/:id', {
        onRequest: [isAuthenticated],
        schema: {
            tags: ['Books'],
            params: {
                type: 'object',
                properties: {
                    id: {type:'string'}
                }
            },
            response: {
                200: {'$ref': 'Book'}
            }
        },
    }, ctrl.getBook)

    app.put('', {
        onRequest: [isAuthenticated],
        schema: {
            tags: ['Books'],
            body: {'$ref': 'Book'},
            response: {
                200: {}
            }
        }
    }, ctrl.update)

    app.post('', {
        onRequest: [isAuthenticated],
        schema: {
            tags: ['Books'],
            body: {
                type: 'object',
                properties: {
                    name: {type: 'string'}
                }
            }
        }
    }, ctrl.create)

    app.delete('/:id', {
        onRequest: [isAuthenticated],
        schema: {
            tags: ['Books'],
            params: {
                type: 'object',
                properties: {
                    id: {type:'string'}
                }
            },
            response: {
                200: {}
            }
        }
    }, ctrl.remove)

    app.log.info('done')
}
