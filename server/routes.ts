import * as path from 'path'
import * as express from 'express'

export default (app: express.Application) => {
    app.use('/api/auth', require('./auth'))
    app.use('/api/user', require('./api/user'))
    app.use('/api/offer', require('./api/offer'))

    app.use('/index', express.static(path.join(__dirname, '../client/index.html')))
    app.use('/.dist', express.static(path.join(__dirname, '../client/.dist')))
    app.use('/', express.static(path.join(__dirname, '../client/.dist')))
    app.use('*', (req: express.Request, res) => {
        console.log(`Redirecting: ${req.method}: ${req.originalUrl}`)
        return res.redirect('/index')
    })
}
