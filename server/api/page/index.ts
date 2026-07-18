import * as ctrl from './controller'
import { FastifyInstance } from 'fastify'
import { isAuthenticated } from '../../auth/auth.service'
import { Page, pageSchema } from './model'



export const buildPageApis = (app: FastifyInstance) => {
    app.log.info('buidling page apis...')
    app.addSchema({...pageSchema.toJSONSchema(), '$id': 'Page'})

    app.get('/:bookId', {
        onRequest: [isAuthenticated],
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
                    items: {'$ref': 'Page'}
                }
            }
        }
    }, ctrl.getPages)

    app.post('', {
        onRequest: [isAuthenticated],
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
            body: {'$ref': 'Page'},
            response: {
                200: {}
            }
        }
    }, ctrl.update)

    app.log.info('done')
}