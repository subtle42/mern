import * as http from 'http'
import { Server } from 'socket.io'
import * as mongoose from 'mongoose'

import fastify, { FastifyRequest } from 'fastify'
import fastSwagger from '@fastify/swagger'
import { writeFileSync } from 'fs'

import * as path from 'path'
import { MongoMemoryServer } from 'mongodb-memory-server'
import config from './config/environment'
import { buildWsServer } from './sockets'
import { buildBookSocket } from './api/book/socket'



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
            level: 'error',
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
        })
        await myFastServer.register(import('@fastify/swagger-ui'))
    }
    await myFastServer.register(import('@fastify/multipart'))
    await myFastServer.register(import('@fastify/jwt'), {
        secret: config.shared.secret,
        verify: {
            // Needed for JWT
            extractToken: (req: FastifyRequest) => req.headers.authorization
        }

    })
    buildWsServer(myFastServer)
    buildBookSocket(myFastServer)

    await myFastServer.register((await import('./api/book')).buildBookApis, {prefix: '/api/books'})
    // await myFastServer.register((await import('./api/page')).buildPageApis, {prefix: '/api/pages'})
    // await myFastServer.register((await import('./api/source')).buildSourceApis, {prefix: '/sources'})
    await myFastServer.register((await import('./api/user')).buildUserApis, {prefix: '/api/user'})
    // await myFastServer.register((await import('./api/widget')).buildWidgetApis, {prefix: '/api/widgets'})
    await myFastServer.register((await import('./auth')).buildAuthApis, {prefix: '/api/auth'})


    await myFastServer.ready()
    
    if (!isTest) {
        const swaggerData = await myFastServer.swagger()
        writeFileSync('swagger.json', JSON.stringify(swaggerData))
    }

    return myFastServer
}



// let myIO = new Server()
// global.myIO = myIO

// myIO.on('connection', socket => {
//     socket.emit('message', socket.id)
// })
// socketAuth(myIO);

// buildMongoDb()
// .then(() => buildServer())
// .then(server => server.listen({port: 3333}))
// .catch(err => console.error(err))


// app.use('/index', express.static(path.join(__dirname, '../client/index.html')))
// app.use('/.dist', express.static(path.join(__dirname, '../client/.dist')))
// app.use('/api/health', (req, res) => {
//     res.json('ok')
// })

// app.use('/', express.static(path.join(__dirname, '../client/.dist')))
// app.use('/{*any}', (req: express.Request, res) => {
//     console.log(`Redirecting: ${req.method}: ${req.originalUrl}`)
//     return res.redirect('/index')
// })

// Used for integration testing, to not start server multiple times
