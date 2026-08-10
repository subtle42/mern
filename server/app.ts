import * as mongoose from 'mongoose'

import fastify, { FastifyRequest } from 'fastify'
import fastSwagger from '@fastify/swagger'
import fastifyWebsocket from '@fastify/websocket';
import { writeFileSync } from 'fs'

import * as path from 'path'
import { MongoMemoryServer } from 'mongodb-memory-server'
import config from './config/environment'
import { buildBookSocket } from './api/book/socket'
import { buildPageSocket } from './api/page/socket'
import { buildSourceSocket } from './api/source/socket'
import { buildWidgetSocket } from './api/widget/socket'



export const buildMongoDb = async() => {
    console.log('building mongo db...')
    const mongod = await MongoMemoryServer.create();
    console.log('creating connection to db...');
    await mongoose.connect(mongod.getUri());
    console.log('connected')
    return mongod
}

export const buildServer = async(isTest?: boolean) => {
    const myFastServer = fastify(isTest ? undefined : {
        logger: {
            level: 'info',
            transport: {
                target: 'pino-pretty',
                options: {
                    translateTime: 'HH:MM:ss Z',
                    ignore: 'pid,hostname',
                },
            }
        },
    })
    if (!isTest) {
        await myFastServer.register(import('@fastify/static'), {
            root: path.join(__dirname, 'static')
        })
        await myFastServer.register(fastSwagger, {
            openapi: {
                openapi: '3.1.0',
                info: {
                    title: 'MERN swagger',
                    description: 'Testing the Fastify swagger API',
                    version: '0.1.0'
                },
                security: [{bearerAuth: []}],
                servers: [{
                    url: 'http://localhost:3333',
                    description: 'The localhost for development'
                }],
                components: {
                    securitySchemes: {
                        bearerAuth: {
                            type: 'http',
                            scheme: 'bearer',
                            bearerFormat: 'JWT',
                            description: 'Enter your JWT token to authenticate'
                        }
                    }
                }
            },
            refResolver: {
                buildLocalReference(json, baseUri, fragment, i) {
                    if (json.$id) return json.$id as string
                    return `def-${i}`
                }
            }
        })
        await myFastServer.register(import('@fastify/swagger-ui'))
    }
    await myFastServer.register(import('@fastify/multipart'))
    await myFastServer.register(import('@fastify/jwt'), {
        secret: config.shared.secret,
        verify: {
            // Needed for JWT
            extractToken: (req: FastifyRequest) => {
                const authHeader = req.headers.authorization
                if (authHeader) return authHeader
                // this is for web tokens
                return (req.query as any).token
            }
        }
    })
    await myFastServer.register(fastifyWebsocket)

    buildBookSocket(myFastServer)
    buildPageSocket(myFastServer)
    buildSourceSocket(myFastServer)
    buildWidgetSocket(myFastServer)

    await myFastServer.register((await import('./api/book')).buildBookApis, {prefix: '/api/books'})
    await myFastServer.register((await import('./api/page')).buildPageApis, {prefix: '/api/pages'})
    await myFastServer.register((await import('./api/source')).buildSourceApis, {prefix: '/api/sources'})
    await myFastServer.register((await import('./api/user')).buildUserApis, {prefix: '/api/user'})
    await myFastServer.register((await import('./api/widget')).buildWidgetApis, {prefix: '/api/widgets'})
    await myFastServer.register((await import('./auth')).buildAuthApis, {prefix: '/api/auth'})
    await myFastServer.register((await import ('./sockets/websocket')).buildSocketServer)

    await myFastServer.ready()
    
    if (!isTest) {
        const swaggerData = await myFastServer.swagger()
        writeFileSync('swagger.json', JSON.stringify(swaggerData))
    }

    return myFastServer
}
