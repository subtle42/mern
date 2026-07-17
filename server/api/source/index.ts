import * as ctrl from './controller'
import { isAuthenticated } from '../../auth/auth.service'
import { FastifyInstance } from 'fastify'
import { SourceSchema } from './model'
import { unlink } from 'fs'


export const buildSourceApis = (app: FastifyInstance) => {
    app.log.info('building source apis...')

    app.get('/:id', {
        onRequest: [isAuthenticated],
        schema: {
            tags: ['Sources'],
            params: {
                type: 'object',
                properties: {
                    id: {type:'string'}
                }
            }
        }
    }, ctrl.getSource)

    app.get('', {
        onRequest: [isAuthenticated],
        schema: {
            tags: ['Sources'],
            response: {
                200: SourceSchema.toJSONSchema()
            }
        }
    }, ctrl.getMySources)

    app.post('', {
        onRequest: [isAuthenticated],
        // onResponse: [async(req, res, done) => {
        //     const data = await req.file()
        //     unlink(`./uploads/${data.filename}`, () => {
        //         console.info(`Removed file: ${data.filename}`)
        //         done()
        //     })
        // }],
        schema: {
            tags: ['Sources'],
            // body: SourceSchema.toJSONSchema(),
            response: {
                200: {type: 'string'}
            }
        }
    }, ctrl.create)

    app.put('', {
        onRequest: [isAuthenticated],
        schema: {
            tags: ['Sources'],
        }
    }, ctrl.update)

    app.delete('/:id', {
        onRequest: [isAuthenticated],
        schema: {
            tags: ['Sources'],
            params: {
                type: 'object',
                properties: {
                    id: {type:'string'}
                }
            }
        }
    }, ctrl.remove)

    app.post('/query', {
        onRequest: [isAuthenticated],
        schema: {
            tags: ['Sources'],
        }
    }, ctrl.query)

    app.log.info('done')
}