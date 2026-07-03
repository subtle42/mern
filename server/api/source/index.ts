import * as ctrl from './controller'
import { isAuthenticated } from '../../auth/auth.service'
import { FastifyInstance } from 'fastify'
import { SourceSchema } from './model'
import { unlink } from 'fs'


export const buildSourceApis = (app: FastifyInstance) => {
    app.get('/:id', {
        onRequest: [isAuthenticated],
        schema: {
            params: {
                type: 'object',
                properties: {
                    id: 'string'
                }
            }
        }
    }, ctrl.getSource)

    app.get('/', {
        onRequest: [isAuthenticated],
        schema: {
            response: {
                200: SourceSchema.toJSONSchema()
            }
        }
    }, ctrl.getMySources)

    app.post('/', {
        onRequest: [isAuthenticated],
        onResponse: [async(req, res, done) => {
            const data = await req.file()
            unlink(`./uploads/${data.filename}`, () => {
                console.info(`Removed file: ${data.filename}`)
                done()
            })
        }],
        schema: {
            body: SourceSchema.toJSONSchema(),
            response: {
                200: 'string'
            }
        }
    }, ctrl.create)

    app.put('/', {
        onRequest: [isAuthenticated],
    }, ctrl.update)

    app.delete('/:id', {
        onRequest: [isAuthenticated],
        schema: {
            params: {
                type: 'object',
                properties: {
                    id: 'string'
                }
            }
        }
    }, ctrl.remove)

    app.post('/query', {
        onRequest: [isAuthenticated],
    }, ctrl.query)
}