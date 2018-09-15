import * as express from 'express'
import * as body from 'body-parser'
import * as http from 'http'
import * as io from 'socket.io'
import * as mongoose from 'mongoose'
import * as passport from 'passport'
import * as utils from './api/utils'
// import { socketAuth } from './auth/socket/auth'
declare var global: any

let MONGO_URI = 'mongodb://localhost/merntest';

(mongoose as any).connect(MONGO_URI, {
    useNewUrlParser: true
});
(mongoose as any).Promise = global.Promise
mongoose.connection.on('error', () => {
    console.error('MongoDB connection error!')
    process.exit(-1)
})

const app = express()
let server = http.createServer(app)

let myIO = io(server, {})
global.myIO = myIO

myIO.on('connection', socket => {
    socket.emit('message', 'connected')
})
// socketAuth(myIO);

const test = () => {
    return (req, res, next) => {
        req.reqId = (new Date()).getTime()
        // utils.logger.info(`${req.method} - ${req.url}: ${req.headers}`)
        utils.logger.info({
            method: req.method,
            url: req.url,
            id: req.reqId,
            headers: req.headers,
            body: req.body
        })
        next()
    }
}

app.use(body.json())
app.use(passport.initialize())
app.use(test())
require('./routes').default(app)

// Used for integration testing, to not start server multiple times
if (global.isFirst === undefined) {
    global.isFirst = true
}
if (global.isFirst === true) {
    server.listen(3333)
    global.isFirst = false
}

export let App = {
    express: app,
    http: server
}
