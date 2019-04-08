
import config from '../server/config/environment'
import { MongoClient } from 'mongodb'

export const cleanDb = () => {
    return Promise.all([
        dropAllCollections(config.db.mongoose.app.dbname),
        dropAllCollections(config.db.mongoose.data.dbname)
    ])
}

const dropAllCollections = (dbName: string): Promise<void> => {
    return MongoClient.connect(`mongodb://${config.db.mongoose.app.host}:${config.db.mongoose.app.port}`)
    .then(client => {
        const myDb = client.db(dbName)
        return myDb.listCollections()
        .toArray()
        .then(collections => Promise.all(collections.map(col => {
            return myDb.dropCollection(col.name)
        })))
        .then(() => client.close(true))
    })
}
