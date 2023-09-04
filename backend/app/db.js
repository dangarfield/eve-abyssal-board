import { MongoClient, ServerApiVersion } from 'mongodb'

// console.log('process.env.MONGO_URI', process.env.MONGO_URI)
const client = new MongoClient(process.env.MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false, // Must be false to use distinct
    deprecationErrors: true
  }
})
const db = client.db('abyssboard')

export const configCollection = db.collection('config')
export const inventoryCollection = db.collection('inventory')
export const contractsCollection = db.collection('contracts')
export const paymentCollection = db.collection('payment')
export const sellersCollection = db.collection('sellers')

// TODO - Ensure indexes
