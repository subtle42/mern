import { FastifyInstance } from 'fastify'
import { bookSchema } from './model'
import { isAuthenticated } from 'server/auth/auth.service'
import * as ctrl from './controller'


export const buildBookApis = (app: FastifyInstance) => {
    app.get('/', {
        preHandler: [isAuthenticated],
        schema: {
            response: {
                200: {
                    type: 'array',
                    items: bookSchema.toJSONSchema()
                }
            }
        }
    }, ctrl.getMyBooks)

    app.get('/:id', {
        preHandler: [isAuthenticated],
        schema: {
            params: {
                type: 'object',
                properties: {
                    id: 'string'
                }
            },
            response: {
                200: bookSchema.toJSONSchema()
            }
        },
    }, ctrl.getBook)

    app.put('/', {
        preHandler: [isAuthenticated],
        schema: {
            body: bookSchema.toJSONSchema(),
            response: {
                200: undefined
            }
        }
    }, ctrl.update)

    app.post('/', {
        preHandler: [isAuthenticated],
        schema: {
            body: bookSchema.toJSONSchema()
        }
    }, ctrl.create)

    app.delete('/:id', {
        schema: {
            params: {
                type: 'object',
                properties: {
                    id: 'string'
                }
            },
            response: {
                200: undefined
            }
        }
    }, ctrl.remove)
}
