import { MongoClient, ServerApiVersion } from 'mongodb'

// console.log('process.env.MONGO_URI', process.env.MONGO_URI)
const client = new MongoClient(process.env.MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})
const db = client.db('abyssboard')

export const configCollection = db.collection('config')
export const inventoryCollection = db.collection('inventory')
export const paymentCollection = db.collection('payment')

// TODO - Ensure indexes
