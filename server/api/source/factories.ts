import config from '../../config/environment'
import { FastifyMongoObject, mongodb } from '@fastify/mongodb'
import { MongoClient } from 'mongodb'



export const columnInspectFactory: {[key: string]: (client: MongoClient, name: string, colRef: string) => Promise<any>} = {
    text: () => Promise.resolve({}),
    group: (client, name, colRef) => {
        const db = client.db(config.db.mongoose.data.dbname)
        return db.collection(name).distinct(colRef, {})
        .then(data => ({ types: data }))
    },
    number: (client, name, colRef) => {
        // return MongoClient.connect(`mongodb://${config.db.mongoose.data.host}:${config.db.mongoose.data.port}`)
            const db = client.db(config.db.mongoose.data.dbname)
            return db.collection(name).aggregate([{
                $group: {
                    _id: {},
                    min: { $min: `$${colRef}` },
                    max: { $max: `$${colRef}` }
                }
            }])
            .toArray()
            .then(data => data[0])
    },
    datetime: (client, name, colRef) => {
        // return MongoClient.connect(`mongodb://${config.db.mongoose.data.host}:${config.db.mongoose.data.port}`)
            const db = client.db(config.db.mongoose.data.dbname)
            return db.collection(name).aggregate([{
                $group: {
                    _id: {},
                    min: { $min: `$${colRef}` },
                    max: { $max: `$${colRef}` }
                }
            }])
            .toArray()
            .then(data => data[0])
    }
}

export const columnInsertEtlFactory = {
    datetime: entry => {
        return new Date(entry)
    },
    number: entry => {
        const tmp = entry.replace('$', '')
        return parseFloat(tmp)
    },
    group: entry => entry,
    text: entry => entry
}
