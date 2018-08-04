import * as express from 'express'
import * as body from 'body-parser'
import * as http from 'http'
import * as io from 'socket.io'
import * as mongoose from 'mongoose'
import * as passport from 'passport'
import { socketAuth } from './auth/socket/auth'

let MONGO_URI = 'mongodb://localhost/merntest';

(mongoose as any).connect(MONGO_URI, {
    // useNewUrlParser: true
});
(mongoose as any).Promise = global.Promise
mongoose.connection.on('error', () => {
    console.error('MongoDB connection error!')
    process.exit(-1)
})

const app = express()
let server = http.createServer(app)

declare var global: any
let myIO = io(server, {})
global.myIO = myIO

myIO.on('connection', socket => {
    socket.emit('message', 'connected')
})
// socketAuth(myIO);

app.use(body.json())
app.use(passport.initialize())
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
