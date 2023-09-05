import { inventoryCollection } from './db.js'

export const getSellerInventory = async (authCharacterId, characterId) => {
  const q = {
    characterId
  }

  // TODO - If the authCharacterId !== characterId, filter only ON_SALE
  const results = await inventoryCollection.find(q).toArray()
  console.log('getSellerInventory', q, results)
  for (const result of results) {
    delete result._id
  }
  return results
}
