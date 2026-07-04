import * as mongoose from 'mongoose'


/**
 * This stops Mongoose from throwing error during integration testing.
 * Due to trying to create a schema that already exists.
 */
export const createSchema = (name: string, schema: mongoose.Schema): any => {
    return mongoose.modelNames().indexOf(name) === -1
        ? mongoose.model(name, schema)
        : mongoose.connection.model(name)
}
