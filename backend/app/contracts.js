import { getAllPublicContracts, getContractItems, getDogmaAttributes } from './eve-api.js'
import { inventoryCollection, contractsCollection } from '../app/db.js'

import { evaluate } from 'mathjs'
import { getAppraisalForItem } from '../../frontend/src/appraisal.js'
import { INVENTORY_STATUS } from './listing-flow.js'

// const loadJSON = (path) => JSON.parse(fs.readFileSync(new URL(path, import.meta.url)))
// const sde = loadJSON('../../frontend/src/generated-data/sde.json')

const dogmaToAttributesRaw = (typeID, dogmaAttributes, sde) => {
  const relevantAttributes = sde.abyssalTypes[typeID].attributes.map(a => a.id)
  // console.log('relevantAttributes', relevantAttributes)
  const filteredAttributes = dogmaAttributes.filter(attr => relevantAttributes.includes(attr.attribute_id))// .map(a => { return { id: a.attribute_id, value: a.value } })
  const filteredAttributesObject = filteredAttributes.reduce((acc, attr) => {
    acc[attr.attribute_id] = attr.value
    return acc
  }, {})

  const derivedAttributes = sde.abyssalTypes[typeID].attributes
    .filter(a => a.type === 'derived')
    .map(attribute => ({
      ...attribute,
      value: evaluate(attribute.valueExpression, { getValue: valueID => filteredAttributesObject[valueID] })
    }))

  derivedAttributes.forEach(attribute => {
    // console.log('der', attribute.valueExpression)
    // console.log('value', attribute.value)
    filteredAttributesObject[attribute.id] = attribute.value
  })
  // console.log('derivedAttributes', derivedAttributes)
  return filteredAttributesObject
}

const runBatches = async (promises, batchSize) => {
  for (let i = 0; i < promises.length; i += batchSize) {
    const batch = promises.slice(i, i + batchSize)
    // console.log('runBatches START', i)
    await Promise.all(batch.map(promiseFn => promiseFn(i / batchSize)))
    // console.log('runBatches END', i)
  }
}

export const updateInventoryFromPublicContracts = async (sde) => {
  try {
    const startTime = new Date()
    console.log('updateInventoryFromPublicContracts START')
    const contracts = await getAllPublicContracts()

    const processedContractIDs = await contractsCollection.distinct('_id', {})
    console.log('processedContractIDs', processedContractIDs)

    const missingContracts = contracts.filter(c => !processedContractIDs.includes(c.id))// .slice(0, 50) // Temp slice
    console.log('missingContracts', missingContracts.length, 'of', contracts.length)

    const missingContractPromises = missingContracts.map(missingContract => async (batchID) => {
    // for (let i = 0; i < missingContracts.length; i++) {
    //   const missingContract = missingContracts[i]
      console.log('Processing', parseInt(batchID * 10), '-', parseInt(((batchID + 1) * 10) - 1), 'of', missingContracts.length, 'missingContracts', missingContract.id)
      const items = await getContractItems(missingContract.id)
      // console.log('items', items)
      const abyssalItems = []
      let plex = 0
      for (const item of items) {
        if (sde.abyssalTypes[item.type_id] && item.is_included) {
          abyssalItems.push(item)
        }
        if (item.type_id === 44992 && !item.is_included) {
          plex += item.quantity
        }
      }

      for (const item of abyssalItems) {
        const dogma = await getDogmaAttributes(item.item_id, item.type_id)
        // console.log('i.dogma', i, i.itemID, i.typeID, i.dogma)
        const filteredAttributesObject = await dogmaToAttributesRaw(item.type_id, dogma.dogma_attributes, sde)

        const appraisal = await getAppraisalForItem({ itemID: item.item_id }, batchID)

        const doc = {
          itemID: item.item_id,
          typeID: item.type_id,
          sourceTypeID: dogma.source_type_id,
          mutatorTypeID: dogma.mutator_type_id,
          attributesRaw: filteredAttributesObject,
          status: 'CONTRACT',
          contract: { id: missingContract.id },
          contractPrice: missingContract.price + (plex * 5000000),
          appraisal
          // characterID: 'tbc',
          // characterName: 'tbc'
        }
        console.log('IS ABYSS!', item, plex, doc)
        await inventoryCollection.updateOne({ _id: doc._id }, { $set: doc }, { upsert: true })
      }
      await contractsCollection.insertOne({ _id: missingContract.id })
    // }
    })
    await runBatches(missingContractPromises, 10)

    const inventoryWithContracts = await inventoryCollection.distinct('contract.id')
    console.log('inventoryWithContracts', inventoryWithContracts)
    const currentActiveContracts = contracts.map(c => c.id)
    console.log('currentActiveContracts', currentActiveContracts)

    const inventoryWithUnavailableContracts = inventoryWithContracts.filter(c => !currentActiveContracts.includes(c))
    console.log('inventoryWithUnavailableContracts', inventoryWithUnavailableContracts)
    await inventoryCollection.updateMany(
      { 'contract.id': { $in: inventoryWithUnavailableContracts } },
      { $set: { status: INVENTORY_STATUS.UNAVAILABLE } }
    )

    const timeTaken = new Date() - startTime
    console.log('updateInventoryFromPublicContracts END', timeTaken, new Date())
  } catch (error) {
    console.log('updateInventoryFromPublicContracts error', error)
  }
}
