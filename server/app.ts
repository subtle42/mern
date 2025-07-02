import * as express from 'express'
import * as body from 'body-parser'
import * as http from 'http'
import { Server } from 'socket.io'
import * as mongoose from 'mongoose'
import * as passport from 'passport'
import * as session from 'express-session'
import * as path from 'path'

import { AuthRouter } from './auth'
import { UserRouter } from './api/user'
import { BookRouter } from './api/book'
import { PageRouter } from './api/page'
import { WidgetRouter } from './api/widget'
import { SourceRouter } from './api/source'

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

const app = express()
let server = http.createServer(app)

let myIO = new Server(server, {})
global.myIO = myIO

myIO.on('connection', socket => {
    socket.emit('message', socket.id)
})
// socketAuth(myIO);

// const test = () => {
//     return (req, res, next) => {
//         req.reqId = (new Date()).getTime()
//         utils.logger.info({
//             method: req.method,
//             url: req.url,
//             id: req.reqId,
//             headers: req.headers,
//             body: req.body
//         })
//         next()
//     }
// }

app.use(body.json())
app.use(passport.initialize())
app.use(session({
    secret: 'KeyboardKittens',
    resave: true,
    saveUninitialized: true
}))
// app.use(test())
// require('./routes').default(app)

app.use('/auth', AuthRouter)
app.use('/api/user', UserRouter)
app.use('/api/books', BookRouter)
app.use('/api/pages', PageRouter)
app.use('/api/widgets', WidgetRouter)
app.use('/api/sources', SourceRouter)

app.use('/index', express.static(path.join(__dirname, '../client/index.html')))
app.use('/.dist', express.static(path.join(__dirname, '../client/.dist')))
app.use('/api/health', (req, res) => {
    res.json('ok')
})

app.use('/', express.static(path.join(__dirname, '../client/.dist')))
app.use('/{*any}', (req: express.Request, res) => {
    console.log(`Redirecting: ${req.method}: ${req.originalUrl}`)
    return res.redirect('/index')
})

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
