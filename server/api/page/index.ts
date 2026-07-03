import * as ctrl from './controller'
import { FastifyInstance } from 'fastify'
import { isAuthenticated } from 'server/auth/auth.service'
import { pageSchema } from './model'



export const buildPageApis = (app: FastifyInstance) => {
    app.get('/:id', {
        preHandler: [isAuthenticated],
        schema: {
            response: {
                200: pageSchema.toJSONSchema()
            }
        }
    }, ctrl.getPages)

    app.post('/', {
        preHandler: [isAuthenticated],
        schema: {
            body: pageSchema.toJSONSchema(),
            response: {
                200: undefined
            }
        }
    }, ctrl.create)

    app.delete('/:id', {
        schema: {
            params: {
                type: 'object',
                properties: {
                    id: 'string'
                }
            }
        }
    }, ctrl.remove)

    app.put('/', {
        preHandler: [isAuthenticated],
        schema: {
            body: pageSchema.toJSONSchema(),
            response: {
                200: undefined
            }
        }
    }, ctrl.update)
}