import { inventoryCollection } from './db'

export const searchForModulesOfType = async (typeID, query) => {
  console.log('searchForModulesOfType', typeID, query)

  const andQuery = []
  andQuery.push({ typeID, status: { $in: ['ON_SALE', 'CONTRACT'] } })
  if (query.attributes !== undefined) {
    for (const attr of query.attributes) {
      const obj = {}
      obj[`attributesRaw.${attr.id}`] = { $gte: attr.min, $lte: attr.max }
      andQuery.push(obj)
    }
  }
  if (query.source !== undefined) {
    andQuery.push({ sourceTypeID: query.source })
  }
  console.log('transformedArray', andQuery)

  const results = await inventoryCollection.aggregate([
    { $match: { $and: andQuery } },
    {
      $lookup: {
        from: 'sellers',
        localField: 'characterId',
        foreignField: '_id',
        as: 'sellerInfo'
      }
    },
    { $unwind: { path: '$sellerInfo', preserveNullAndEmptyArrays: true } },
    { $addFields: { discordName: '$sellerInfo.discordName' } }
  ]).toArray()

  for (const result of results) {
    delete result._id
  }
  console.log('results', results, results.length)
  return results
}
