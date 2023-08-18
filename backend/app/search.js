import { inventoryCollection } from './db'
import { INVENTORY_STATUS } from './listing-flow'

export const searchForModulesOfType = async (typeID, query) => {
  console.log('searchForModulesOfType', typeID, query)

  const andQuery = []
  andQuery.push({ typeID })
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
  //   const transformedArray = Object.keys(query).map(key => {
  //     const attributeKey = `attributesRaw.${key}`
  //     const { min, max } = query[key]
  //     return {
  //       [attributeKey]: { $gte: min, $lte: max }
  //     }
  //   })// .filter(q => q['attributesRaw.100003'])
  //   const andQuery = [...[{ typeID, status: INVENTORY_STATUS.ON_SALE }], ...transformedArray]
  //   const andQuery = [...[{ typeID }]]
  console.log('transformedArray', andQuery)

  const results = await inventoryCollection.find({
    $and: andQuery
  }).toArray()
  console.log('results', results.length)

  return { count: results.length, results }
}
