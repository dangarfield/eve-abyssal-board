import { getAppraisalForItemIDs } from './appraisal.js'
import { inventoryCollection } from './db.js'

export const getSellerInventory = async (authCharacterId, characterId) => {
  const q = {
    characterId
  }
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
  console.log('itemIDsToAddAppraisals', itemIDsToAddAppraisals)
  const appraisals = await getAppraisalForItemIDs(itemIDsToAddAppraisals)
  const appraisalsKeys = Object.keys(appraisals)
  console.log('appraisals', appraisalsKeys)
  for (let i = 0; i < appraisalsKeys.length; i++) {
    const itemIDString = appraisalsKeys[i]
    const appraisal = appraisals[itemIDString]
    const itemID = parseInt(itemIDString)
    console.log('Updating appraisal', `${i + 1} of ${appraisalsKeys.length}`, itemIDString, itemID, appraisal)
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
  console.log('updateMissingAppraisals results', itemIDsToAddAppraisals.length)
}
