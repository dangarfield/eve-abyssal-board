import { getAppraisalForItemID } from './appraisal.js'
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
export const getTypeIDCounts = async () => {
  const result = await inventoryCollection.aggregate([
    { $match: { status: { $ne: 'UNAVAILABLE' } } },
    { $group: { _id: '$typeID', count: { $sum: 1 } } }
  ]).toArray()
  const countByTypeID = result.reduce((obj, item) => ({ ...obj, [item._id]: item.count }), {})
  return countByTypeID
}
export const updateMissingAppraisals = async () => {
  // await inventoryCollection.updateMany({}, { $unset: { appraisal: '' } })

  const itemIDsToAddAppraisals = await inventoryCollection.distinct('_id',
    {
      $or: [
        { appraisal: { $exists: false } },
        { appraisal: { $not: { $elemMatch: { type: 'AUTO' } } } },
        { appraisal: { $elemMatch: { type: 'AUTO', price: 'Error' } } }
      ]
    }
  )
  for (let i = 0; i < itemIDsToAddAppraisals.length; i++) {
    const itemID = itemIDsToAddAppraisals[i]
    if (itemID !== null) {
      const appraisal = await getAppraisalForItemID(itemID)
      console.log('appraisal', i + 1, 'of', itemIDsToAddAppraisals.length, '-', itemID, appraisal)
      await inventoryCollection.updateOne(
        { _id: itemID },
        {
          $pull: {
            appraisal: { type: 'AUTO', price: 'Error' }
          }
        }
      )
      await inventoryCollection.updateOne(
        { _id: itemID },
        {
          $push: {
            appraisal: { $each: [appraisal] }
          }
        }
      )
    }
  }
  console.log('updateMissingAppraisals results', itemIDsToAddAppraisals.length)
}
