import { Response } from 'express'
import * as mongoose from 'mongoose'

export default class Util {
    public static handleError = (res: Response, statusCode?: number): any => {
        statusCode = statusCode || 500
        return (err) => {
            res.status(statusCode).send(err).end()
        }
    }

    public static handleNoResult = (res: Response): any => {
        return (entity) => {
            if (!entity) {
                res.status(401).end()
                return null
            }
            return entity
        }
    }

    public static handleResponse = (res: Response, statusCode?: number): any => {
        statusCode = statusCode || 200
        return (entity) => {
            res.status(statusCode).json(entity)
            return entity
        }
    }

    public static handleResponseNoData = (res: Response, statusCode?: number): any => {
        statusCode = statusCode || 200
        return (entity) => res.status(statusCode).json()
    }

    /**
     * This stops Mongoose from throwing error during integration testing.
     * Due to trying to create a schema that already exists.
     */
    public static createSchema = (name: string, schema: mongoose.Schema): any => {
        return mongoose.modelNames().indexOf(name) === -1
            ? mongoose.model(name, schema)
            : mongoose.connection.model(name)
    }
}
