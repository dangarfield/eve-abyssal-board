import { MongoClient, ServerApiVersion } from 'mongodb'

const MONGO_URI_LOCAL = 'mongodb+srv://abyssboard:XN7zG0dqxbfYvLtR@cluster0.pyd0yep.mongodb.net/?retryWrites=true&w=majority'
const MONGO_URI_PROD = 'mongodb+srv://abyssboard:Jaa5Xz9eSqxdXTvv@cluster0.wrkxbu6.mongodb.net/?retryWrites=true&w=majority'

const init = async () => {
  // Local setup
  const clientLocal = new MongoClient(MONGO_URI_LOCAL, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: false, // Must be false to use distinct
      deprecationErrors: true
    }
  })
  const dbLocal = clientLocal.db('abyssboard')

  const inventoryCollectionLocal = dbLocal.collection('inventory')
  const contractsCollectionLocal = dbLocal.collection('contracts')

  // Prod setup
  const clientProd = new MongoClient(MONGO_URI_PROD, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: false, // Must be false to use distinct
      deprecationErrors: true
    }
  })
  const dbProd = clientProd.db('abyssboard')

  const inventoryCollectionProd = dbProd.collection('inventory')
  const contractsCollectionProd = dbProd.collection('contracts')

  // Inventory
  const inventoryProd = await inventoryCollectionProd.find({ status: 'ON_SALE' }).toArray()
  console.log('inventoryProd', inventoryProd.length)
  for (const inv of inventoryProd) {
    if (inv.status === 'CONTRACT' || inv.status === 'UNAVAILABLE') delete inv.status
    if (inv.contractPrice) {
      inv.contract.price = inv.contractPrice
      delete inv.contractPrice
    }
  }

  await inventoryCollectionLocal.deleteMany()
  await inventoryCollectionLocal.insertMany(inventoryProd)
  const inventoryLocal = await inventoryCollectionLocal.find().toArray()
  console.log('inventoryLocal', inventoryLocal.length)

  // Contracts
  const contractsProd = await contractsCollectionProd.find().toArray()
  console.log('contractsProd', contractsProd.length)

  await contractsCollectionLocal.deleteMany()
  // await contractsCollectionLocal.insertMany(contractsProd)
  const contractsLocal = await contractsCollectionLocal.find().toArray()
  console.log('contractsLocal', contractsLocal.length)

  console.log('COMPLETE')
}

init()
