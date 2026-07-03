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

// import * as utils from './api/utils'
declare const global: any

let MONGO_URI = 'mongodb://localhost/merntest';

(mongoose as any).connect(MONGO_URI, {
    useNewUrlParser: true
});
(mongoose as any).Promise = global.Promise
mongoose.connection.on('error', () => {
    console.error('MongoDB connection error!')
    process.exit(-1)
})

let server = http.createServer()

const buildServer = async() => {

    const myFastServer = fastify({
        logger: true,
    })
    await myFastServer.register(multipart)
    await myFastServer.register(fastSwagger, {
        openapi: {
            openapi: '3.0',
            info: {
                title: 'MERN swagger',
                description: 'Testing the Fastify swagger API',
                version: '0.1.0'
            },
        }
    })

    await myFastServer.register(buildBookApis, {prefix: '/books'})
    await myFastServer.register(buildPageApis, {prefix: '/pages'})
    await myFastServer.register(buildSourceApis, {prefix: '/sources'})
    await myFastServer.register(buildUserApis, {prefix: '/users'})
    await myFastServer.register(buildWidgetApis, {prefix: '/widgets'})
    await myFastServer.register(buildAuthApis, {prefix: '/auth'})

    const swaggerData = await myFastServer.swagger()
    writeFileSync('../../swagger.json', JSON.stringify(swaggerData))
    return myFastServer
}



let myIO = new Server(server, {})
global.myIO = myIO

myIO.on('connection', socket => {
    socket.emit('message', socket.id)
})
// socketAuth(myIO);

buildServer()
.then(server => server.listen({port: 3333}))


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
