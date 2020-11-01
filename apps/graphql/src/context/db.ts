import dotent from 'dotenv'
import { MongoClient } from 'mongodb'

const result = dotent.config()
if (result.error) {
    console.error(result.error)
}

const connectionString = process.env.MONGO_CONNECTION_STRING!
const dbName = `sc2iq`
const mongoClient = new MongoClient(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });

export const getDb = async () => {
    const client = await mongoClient.connect()
    const db = client.db(dbName)

    return db
}

export default getDb