import { getAllPublicContracts, getContractItems, getDogmaAttributes } from './eve-api.js'
import { inventoryCollection, contractsCollection } from '../app/db.js'
import { evaluate } from 'mathjs'

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

export const runBatches = async (promises, batchSize) => {
  for (let i = 0; i < promises.length; i += batchSize) {
    const batch = promises.slice(i, i + batchSize)
    // console.log('runBatches START', i)
    await Promise.all(batch.map(promiseFn => promiseFn(i / batchSize)))
    // console.log('runBatches END', i)
  }
}

export const updateInventoryFromPublicContracts = async (sde) => {
  const startTime = new Date()
  console.log('updateInventoryFromPublicContracts START')

  const processedContractIDs = (await contractsCollection.findOne({ _id: 'processed' }))?.contracts || []

  const activeContracts = await getAllPublicContracts()
  const activeContractsSet = new Set(activeContracts.map(c => c.id))

  const allInventoryIDs = await inventoryCollection.distinct('_id')
  const currentInventoryContractIDs = await inventoryCollection.distinct('contract.id')
  const currentInventoryContractsSet = new Set(currentInventoryContractIDs)

  const contractsThatBecameActive = [...activeContractsSet].filter((contractID) => !currentInventoryContractsSet.has(contractID))
  const contractsThatBecameInactive = [...currentInventoryContractsSet].filter((contractID) => !activeContractsSet.has(contractID))

  const activeContractInventoryWithNoDirectListing = (await inventoryCollection.find({ contract: { $exists: true }, status: { $exists: false } }).toArray()).map(c => c.contract.id)
  const activeContractInventoryWithNoDirectListingSet = new Set(activeContractInventoryWithNoDirectListing)
  const activeContractInventoryWithDirectListing = (await inventoryCollection.find({ contract: { $exists: true }, status: { $exists: true } }).toArray()).map(c => c.contract.id)
  const activeContractInventoryWithDirectListingSet = new Set(activeContractInventoryWithDirectListing)

  console.log('contractsThatBecomeActive', contractsThatBecameActive.length)

  const docsToInsert = []
  const bulkUpdateOperation = inventoryCollection.initializeUnorderedBulkOp()

  const contractsThatBecameActivePromises = contractsThatBecameActive
    // .slice(20000, 21000)
    .map(contractID => async (batchID) => {
      try {
        const contract = activeContracts.find(c => c.id === contractID)
        // console.log('contractsThatBecameActive', contract, batchID)
        console.log('Processing', parseInt(batchID * 10), '-', parseInt(((batchID + 1) * 10) - 1), 'of', contractsThatBecameActive.length, 'contractThatBecameActive', contract.id)
        if (processedContractIDs.includes(contractID)) {
          console.log('  already processed')
          return
        }
        const items = await getContractItems(contract.id)
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
          const itemInInventory = allInventoryIDs.includes(item.item_id)
          console.log('ABYSSAL ITEM ->', item.item_id, item.type_id, plex, 'In inventory?', itemInInventory)
          if (itemInInventory) {
            // NO CONTRACT - YES DIRECT - BECOMES ACTIVE CONTRACT
            // if it already exist in db, it is direct listed, so we don't need to insert, only update with contract.id & contract.price
            bulkUpdateOperation.find({ _id: item.item_id }).update({ $set: { contract: { id: contract.id, price: contract.price + (plex * 5000000) } } })
          } else {
            // NO CONTRACT - NO DIRECT - BECOMES ACTIVE CONTRACT
            // if is doensn't exist, it's new, so get dogma attributes etc, and insert whole document

            const dogma = await getDogmaAttributes(item.item_id, item.type_id)
            // console.log('i.dogma', i, i.itemID, i.typeID, i.dogma)
            const filteredAttributesObject = await dogmaToAttributesRaw(item.type_id, dogma.dogma_attributes, sde)

            const doc = {
              _id: item.item_id,
              itemID: item.item_id,
              typeID: item.type_id,
              sourceTypeID: dogma.source_type_id,
              mutatorTypeID: dogma.mutator_type_id,
              attributesRaw: filteredAttributesObject,
              contract: { id: contract.id, price: contract.price + (plex * 5000000) }
              // appraisal: [appraisal] // Get appraisals afters, focus on inventory first
              // characterID: 'tbc',
              // characterName: 'tbc'
            }
            docsToInsert.push(doc) // Insert in one go when finished
          }
        }
      } catch (error) {
        console.log('updateInventoryFromPublicContracts error', error)
      }
    })
  await runBatches(contractsThatBecameActivePromises, 10)
  if (docsToInsert.length > 0) {
    console.log('docsToInsert', docsToInsert, docsToInsert.length)
    await inventoryCollection.insertMany(docsToInsert)
  }

  if (bulkUpdateOperation.length > 0) {
    const bulkUpdateOperationResult = await bulkUpdateOperation.execute()
    console.log('bulkUpdateOperationResult', bulkUpdateOperationResult, bulkUpdateOperation.length)
  }

  // YES CONTRACT - NO DIRECT - CONTRACT NOT AVAILABLE
  const contractsToRemoveFromSystem = contractsThatBecameInactive.filter((contractID) => activeContractInventoryWithNoDirectListingSet.has(contractID))
  console.log('contractsToRemoveFromSystem', contractsToRemoveFromSystem.length)
  await inventoryCollection.deleteMany({ 'contract.id': { $in: contractsToRemoveFromSystem } })

  // YES CONTRACT - YES DIRECT - CONTRACT NOT AVAILABLE
  const contractsToGoBackToDirectListing = contractsThatBecameInactive.filter((contractID) => activeContractInventoryWithDirectListingSet.has(contractID))
  console.log('contractsToGoBackToDirectListing', contractsToGoBackToDirectListing.length)
  await inventoryCollection.updateMany(
    { 'contract.id': { $in: contractsToGoBackToDirectListing } },
    { $unset: { contract: 1 } }
  )

  await contractsCollection.updateOne({ _id: 'processed' }, { $set: { contracts: contractsThatBecameActive } }, { upsert: true })

  const timeTaken = new Date() - startTime
  console.log('updateInventoryFromPublicContracts END', timeTaken, new Date())
}
