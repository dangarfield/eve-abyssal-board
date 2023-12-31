import { Api } from 'eve-esi-swaggerts'
import { getCurrentUserAccessToken, refreshTokenAndGetNewUserAccessToken } from './auth'
import { getAbyssModuleTypesFlatIds } from './module-types'
import sde from './generated-data/sde.json'
import { getCurrentSellerInventory } from './board-api'
import { inventoryToInventoryCardDTO, dogmaToAttributesRaw } from './dogma-utils'
import naturalSort from 'natural-sort'
const esi = new Api()

const getInventoryContainerNames = async (locationIDs) => {
  try {
    if (locationIDs.length === 0) return {}
    console.log('getInventoryContainerNames', locationIDs)
    const { characterId, accessToken } = await getCurrentUserAccessToken()
    const req = await esi.characters.postCharactersCharacterIdAssetsNames(characterId, locationIDs, { token: accessToken })
    const res = await req
    const locationNames = res.data.reduce((obj, item) => {
      obj[item.item_id] = item.name
      return obj
    }, {})

    // console.log('res', res)
    return locationNames
  } catch (error) {
    console.error('getInventoryContainerNames error', error)
  }
  return {}
}
const getInventoryLocationNames = async (locationIDs) => {
  try {
    if (locationIDs.length === 0) return {}
    console.log('getInventoryLocationNames', locationIDs)
    // locationIDs.push('asd')
    const { accessToken } = await getCurrentUserAccessToken()
    const req = await esi.universe.postUniverseNames(locationIDs, { token: accessToken })
    const res = await req
    const locationNames = res.data.reduce((obj, item) => {
      obj[item.id] = item.name
      return obj
    }, {})

    // console.log('res', res)
    return locationNames
  } catch (error) {
    console.error('getInventoryLocationNames error', error)
  }
  return {}
}
const getDogmaAndDTO = async (inventory) => {
  const batchSize = 100
  const numBatches = Math.ceil(inventory.length / batchSize)

  const consolidatedOutput = []
  const containerNames = await getInventoryContainerNames([...new Set(inventory.filter(i => ['AutoFit', 'Unlocked'].includes(i.location_flag) && (parseInt(i.location_id) > 1000000000000)).map(i => i.location_id))])
  const locationNames = await getInventoryLocationNames([...new Set(inventory.filter(i => ['Hangar', 'Cargo'].includes(i.location_flag) && (parseInt(i.location_id) < 1000000000000)).map(i => i.location_id))])
  console.log('containerNames', containerNames)
  console.log('locationNames', locationNames)
  for (let i = 0; i < numBatches; i++) {
    const startIdx = i * batchSize
    const endIdx = Math.min((i + 1) * batchSize, inventory.length)
    const batch = inventory.slice(startIdx, endIdx)

    const batchOutput = await Promise.all(batch.map(async (i) => {
      // console.log('getDogmaDynamicItemsTypeIdItemId', i.item_id)
      const dogma = (await esi.dogma.getDogmaDynamicItemsTypeIdItemId(i.item_id, i.type_id)).data
      const filteredAttributesObject = dogmaToAttributesRaw(i.type_id, dogma.dogma_attributes)

      const data = {
        itemID: i.item_id,
        typeID: i.type_id,
        sourceTypeID: dogma.source_type_id,
        mutatorTypeID: dogma.mutator_type_id,
        attributesRaw: filteredAttributesObject,
        status: 'NONE'
      }

      // console.log('inv', i)
      // TODO - Note: that attributesRaw really needs to contain the base-module values as well as the dynamic values so it's searchable in the DB
      // Update - This is set for base-module, just need to implement dynamic values
      const inv = inventoryToInventoryCardDTO(data)
      if (i.location_id) {
        data.location = {
          location_id: i.location_id,
          location_flat: i.location_flag,
          location_type: i.location_type
        }
        if (['AutoFit', 'Unlocked'].includes(i.location_flag)) {
          data.location.container_name = containerNames[i.location_id] ? containerNames[i.location_id] : 'Unknown container'
        } else {
          data.location.location_name = locationNames[i.location_id] ? locationNames[i.location_id] : 'Ship Cargo'
          console.log('data.location', data.location)
        }
      }
      return inv
    }))
    sendLoadingStatusEvent('dogma', `Fetched mod attributes ${Math.min(startIdx, inventory.length)} of ${inventory.length}`)
    consolidatedOutput.push(...batchOutput)
  }
  sendLoadingStatusEvent('dogma', `Fetched mod attributes ${inventory.length} of ${inventory.length} - COMPLETE`)
  return consolidatedOutput
}
export const sendLoadingStatusEvent = (type, msg) => {
  const eventData = { type, msg }

  // Create a custom event
  const customEvent = new window.CustomEvent('loadingStatusEvent', {
    detail: eventData
  })

  // Dispatch the custom event
  document.dispatchEvent(customEvent)
}

// TODO - Move a lot of this to dogma-utils.js etc
export const getCurrentUserModInventory = async () => {
  let { characterId, accessToken } = await getCurrentUserAccessToken()

  let maxPage = 1
  let pagesFetched = 0
  let inventory = []
  let cacheExpires
  let lastModified
  do {
    try {
      sendLoadingStatusEvent('assets', 'Fetch initial assets')
      const req = esi.characters.getCharactersCharacterIdAssets(characterId, { token: accessToken, page: pagesFetched + 1 })
      const res = await req
      const maxPagesHeader = res.headers.get('X-Pages')

      //   console.log('maxPagesHeader', maxPagesHeader)
      if (maxPagesHeader !== undefined) { maxPage = parseInt(maxPagesHeader) }

      console.log('ESI inventory debug', res.data)
      // for (let i = 0; i < 300; i++) {
      inventory.push(...res.data)
      // }
      pagesFetched++
      sendLoadingStatusEvent('assets', `Fetched page ${pagesFetched} of ${maxPage}`)
      cacheExpires = new Date(`${res.headers.get('Expires')}`)
      lastModified = new Date(`${res.headers.get('Last-Modified')}`)
    //   console.log('cacheExpires', cacheExpires)
    } catch (error) {
      console.log('res.error', error)
      await refreshTokenAndGetNewUserAccessToken()
      const userDetails = await getCurrentUserAccessToken()
      accessToken = userDetails.accessToken
    }
  } while (pagesFetched < maxPage)
  sendLoadingStatusEvent('assets', `Fetched page ${pagesFetched} of ${maxPage} - COMPLETE`)
  const abyssTypesFlat = getAbyssModuleTypesFlatIds()
  // console.log('abyssTypesFlat', abyssTypesFlat)
  // const abyssModuleTypes = getAbyssModuleTypes()
  console.log('inventory flags debug', inventory.filter(i => abyssTypesFlat.includes(i.type_id)).map(i => `${i.item_id} - ${i.type_id} - ${i.location_id} - ${i.location_flag}`))
  inventory = inventory.filter(i => abyssTypesFlat.includes(i.type_id) && ['Hangar', 'Cargo', 'AutoFit', 'Unlocked'].includes(i.location_flag))

  // .filter(i => i.item_id === 1037642882589)
  // .filter(i => i.item_id === 1039196810422)
  // .filter(i => i.item_id === 1042529494917)
  // .filter(i => i.type_id === 49730)

  console.log('sde', sde)
  inventory = await getDogmaAndDTO(inventory)
  console.log('inventory', inventory)

  inventory.sort((a, b) => naturalSort()(a.typeName, b.typeName) || a.itemID - b.itemID)
  sendLoadingStatusEvent('seller', 'Fetching listed inventory')
  const currentInventory = await getCurrentSellerInventory()
  for (const inventoryItem of inventory) {
    for (const currentInventoryItem of currentInventory) {
      if (inventoryItem.itemID === currentInventoryItem.itemID) {
        inventoryItem.status = currentInventoryItem.status
        inventoryItem.appraisal = currentInventoryItem.appraisal
        inventoryItem.listingPrice = currentInventoryItem.listingPrice
        // console.log('currentInventoryItem', inventoryItem, currentInventoryItem)
      }
    }
  }
  sendLoadingStatusEvent('seller', 'Fetching listed inventory - COMPLETE')
  return { inventory, cacheExpires, lastModified }
}
export const getCorpForChar = async (characterId, accessToken) => {
  const corpId = (await esi.characters.postCharactersAffiliation([characterId])).data[0].corporation_id
  const corpName = (await esi.corporations.getCorporationsCorporationId(corpId)).data.name
  // console.log('corpId', corpId, corpName)
  return { corpId, corpName }
}
// List of modules
// https://github.com/stephenswat/eve-abyssal-market/blob/master/abyssal_modules/models/modules.py

export const openBuyerToSellerDraftEVEMail = async (moduleTypeID, moduleID, moduleName, price, sellerName, sellerID) => {
  const { accessToken } = await getCurrentUserAccessToken()
  console.log('openBuyerToSellerDraftEVEMail', moduleID, moduleName, price, sellerName, sellerID)
  const result = await esi.ui.postUiOpenwindowNewmail({
    // body: `body - ID ${moduleID} - Name ${moduleName} - Price ${price} -> Buyer: ${sellerName} ${sellerID}`,
    body: `<font size="14" color="#bfffffff">Hi <font size="14" color="#ffd98d00"><a href="showinfo:1376//${sellerID}">${sellerName}</a></font>,<br><br>
I saw your module on Abyss Board: <font size="14" color="#ffd98d00"><a href="showinfo:${moduleTypeID}//${moduleID}">${moduleName}</a></font><br><br>
I'm interested in making an offer, would you accept:<br><br>
${price} <br><br>
Thanks!</font>`.replace(/\n/g, ''),
    recipients: [sellerID],
    subject: `Abyss Board - Offer - ${moduleName}`
  }, { token: accessToken })
  console.log('openBuyerToSellerDraftEVEMail', result)
}
export const openContractInEVEOnline = async (contractID) => {
  console.log('openContractInEVEOnline', contractID)
  const { accessToken } = await getCurrentUserAccessToken()
  await esi.ui.postUiOpenwindowContract({ contract_id: contractID, token: accessToken })
}
