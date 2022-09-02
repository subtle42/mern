import { MongoClient } from 'mongodb'
import config from '../../config/environment'

export const columnInspectFactory: {[key: string]: (name: string, colRef: string) => Promise<any>} = {
    text: () => Promise.resolve({}),
    group: (name: string, colRef: string) => {
        return MongoClient.connect(`mongodb://${config.db.mongoose.data.host}:${config.db.mongoose.data.port}`)
        .then(client => {
            const db = client.db(config.db.mongoose.data.dbname)
            return db.collection(name).distinct(colRef, {})
            .then(data => ({ types: data }))
            .finally(() => client.close())
        })
    },
    number: (name: string, colRef: string) => {
        return MongoClient.connect(`mongodb://${config.db.mongoose.data.host}:${config.db.mongoose.data.port}`)
        .then(client => {
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
            .finally(() => client.close())
        })
    },
    datetime: (name: string, colRef: string) => {
        return MongoClient.connect(`mongodb://${config.db.mongoose.data.host}:${config.db.mongoose.data.port}`)
        .then(client => {
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
            .finally(() => client.close())
        })
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
