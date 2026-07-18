import * as ctrl from './controller'
// import * as auth from '../../auth/auth.service'
import { FastifyInstance } from 'fastify'
import { isAuthenticated } from '../../auth/auth.service'
import { WidgetSchema } from './model'


export const buildWidgetApis = (app: FastifyInstance) => {
    app.log.info('building widget apis...')
    app.addSchema({...WidgetSchema.toJSONSchema(), '$id': 'Widget'})

    app.post('', {
        onRequest: [isAuthenticated],
        schema: {
            tags: ['Widget'],
            // body: WidgetSchema.toJSONSchema(),
            response: {
                200: {type: 'string'}
            }
        }
    }, ctrl.create)

    app.post('/multiple', {
        onRequest: [isAuthenticated],
        schema: {
            tags: ['Widget'],
            // body: {
            //     type: 'array',
            //     items: WidgetSchema.toJSONSchema()
            // },
            response: {
                200: {
                    type: 'array',
                    items: {type: 'string'}
                }
            }
        }
    }, ctrl.createMultiple)

    app.delete('/:widgetId/:pageId/:bookId', {
        onRequest: [isAuthenticated],
        schema: {
            tags: ['Widget'],
            params: {
                type: 'object',
                properties: {
                    widgetId: {type: 'string'},
                    pageId: {type: 'string'},
                    bookId: {type: 'string'},
                }
            },
            response: {
                200: {}
            }
        }
    }, ctrl.remove)

    app.put('', {
        onRequest: [isAuthenticated],
        schema: {
            tags: ['Widget'],
            body: WidgetSchema.toJSONSchema(),
            response: {
                200: {type: 'string'}
            }
        }
    }, ctrl.update)

    app.get('/:id', {
        onRequest: [isAuthenticated],
        schema: {
            tags: ['Widget'],
            response: {
                200: WidgetSchema.toJSONSchema()
            }
        },
    }, ctrl.get)

    app.log.info('done')
}
