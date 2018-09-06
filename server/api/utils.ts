import { Response } from 'express'
import * as mongoose from 'mongoose'
import { createLogger, transports, format } from 'winston'

const myLogger = createLogger({
    transports: [
        new transports.File({
            maxsize: 1000000,
            dirname: '.uploads',
            filename: 'error.log',
            level: 'error'
        }),
        new transports.File({
            maxsize: 1000000,
            dirname: '.uploads',
            filename: 'combined.log'
        })
    ]
})

if (process.env.NODE_ENV !== 'production') {
    myLogger.add(new transports.Console({
        format: format.splat(),
        level: 'error'
    }))
}

export const logger = myLogger

export const handleError = (res: Response, statusCode?: number): any => {
    statusCode = statusCode || 500
    return (err) => {
        logger.error({
            method: res.req.method,
            url: res.req.url,
            id: res.req['reqId'],
            headers: res.req.headers,
            body: res.req.body,
            error: err
        })
        res.status(statusCode).send(err).end()
    }
}

export const handleNoResult = (res: Response): any => {
    return (entity) => {
        if (!entity) {
            res.status(401).end()
            return null
        }
        return entity
    }
}

export const handleResponse = (res: Response, statusCode?: number): any => {
    statusCode = statusCode || 200
    return (entity) => {
        res.status(statusCode).json(entity)
        return entity
    }
}

export const handleResponseNoData = (res: Response, statusCode?: number): any => {
    statusCode = statusCode || 200
    return (entity) => res.status(statusCode).json()
}

/**
 * This stops Mongoose from throwing error during integration testing.
 * Due to trying to create a schema that already exists.
 */
export const createSchema = (name: string, schema: mongoose.Schema): any => {
    return mongoose.modelNames().indexOf(name) === -1
        ? mongoose.model(name, schema)
        : mongoose.connection.model(name)
}
