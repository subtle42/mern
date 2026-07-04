import * as http from 'http'
import { Server } from 'socket.io'
import * as mongoose from 'mongoose'

import { buildUserApis } from './api/user'
import { buildBookApis } from './api/book'
import { buildPageApis } from './api/page'
import { buildWidgetApis } from './api/widget'
import { buildSourceApis } from './api/source'
import { buildAuthApis } from './auth'
import fastify from 'fastify'
import fastSwagger from '@fastify/swagger'
import multipart from '@fastify/multipart'
import { writeFileSync } from 'fs'
import fastifyStatic from '@fastify/static'

import * as path from 'path'
import { MongoMemoryServer } from 'mongodb-memory-server'

// import * as utils from './api/utils'
// declare const global: any


export const buildMongoDb = async() => {
    console.log('building mongo db...')
    const mongod = await MongoMemoryServer.create();
    console.log('creating connection to db...');
    (mongoose as any).connect(mongod.getUri(), {
        useNewUrlParser: true
    });
    (mongoose as any).Promise = global.Promise
    mongoose.connection.on('error', () => {
        console.error('MongoDB connection error!')
        process.exit(-1)
    })
}

export const buildServer = async() => {

    const myFastServer = fastify({
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
    await myFastServer.register(fastifyStatic, {
        root: path.join(__dirname, 'static')
    })
    await myFastServer.register(multipart)
    await myFastServer.register(fastSwagger, {
        openapi: {
            openapi: '3.1.0',
            info: {
                title: 'MERN swagger',
                description: 'Testing the Fastify swagger API',
                version: '0.1.0'
            },
            servers: [{
                url: 'http://localhost:3333',
                description: 'The localhost for development'
            }]
        }
    })
    if (1 === 1) {
        await myFastServer.register(import('@fastify/swagger-ui'), {})
    }

    await myFastServer.register(buildBookApis, {prefix: '/books'})
    await myFastServer.register(buildPageApis, {prefix: '/pages'})
    await myFastServer.register(buildSourceApis, {prefix: '/sources'})
    await myFastServer.register(buildUserApis, {prefix: '/users'})
    await myFastServer.register(buildWidgetApis, {prefix: '/widgets'})
    await myFastServer.register(buildAuthApis, {prefix: '/auth'})

    await myFastServer.ready()
    const swaggerData = await myFastServer.swagger()
    writeFileSync('swagger.json', JSON.stringify(swaggerData))

    return myFastServer
}



let myIO = new Server()
global.myIO = myIO

myIO.on('connection', socket => {
    socket.emit('message', socket.id)
})
// socketAuth(myIO);

buildMongoDb()
.then(() => buildServer())
.then(server => server.listen({port: 3333}))
.catch(err => console.error(err))


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
