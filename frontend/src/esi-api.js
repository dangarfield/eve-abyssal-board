import { Api } from 'eve-esi-swaggerts'
import { getCurrentUserAccessToken, refreshTokenAndGetNewUserAccessToken } from './auth'
import { getAbyssModuleTypesFlatIds } from './module-types'
import sde from './generated-data/sde.json'
import { getCurrentSellerInventory } from './board-api'
import { inventoryToInventoryCardDTO, dogmaToAttributesRaw } from './dogma-utils'
import naturalSort from 'natural-sort'
const esi = new Api()

// TODO - Move a lot of this to dogma-utils.js etc
export const getCurrentUserModInventory = async () => {
  let { characterId, accessToken } = getCurrentUserAccessToken()

  let maxPage = 1
  let pagesFetched = 0
  let inventory = []
  let cacheExpires
  let lastModified
  do {
    try {
      const req = esi.characters.getCharactersCharacterIdAssets(characterId, { token: accessToken, page: pagesFetched + 1 })
      const res = await req
      const maxPagesHeader = res.headers.get('X-Pages')
      //   console.log('maxPagesHeader', maxPagesHeader)
      if (maxPagesHeader !== undefined) { maxPage = parseInt(maxPagesHeader) }

      console.log('res.data', res.data)
      inventory.push(...res.data)
      pagesFetched++
      cacheExpires = new Date(`${res.headers.get('Expires')}`)
      lastModified = new Date(`${res.headers.get('Last-Modified')}`)
    //   console.log('cacheExpires', cacheExpires)
    } catch (error) {
      console.log('res.error', error)
      await refreshTokenAndGetNewUserAccessToken()
      const userDetails = getCurrentUserAccessToken()
      accessToken = userDetails.accessToken
    }
  } while (pagesFetched < maxPage)

  const abyssTypesFlat = getAbyssModuleTypesFlatIds()
  console.log('abyssTypesFlat', abyssTypesFlat)
  // const abyssModuleTypes = getAbyssModuleTypes()
  inventory = inventory.filter(i => abyssTypesFlat.includes(i.type_id) && ['Hangar', 'Cargo', 'AutoFit'].includes(i.location_flag))

  // .filter(i => i.item_id === 1037642882589)
  // .filter(i => i.item_id === 1039196810422)
  // .filter(i => i.item_id === 1042529494917)
  // .filter(i => i.type_id === 49730)

  console.log('sde', sde)
  inventory = await Promise.all(inventory.map(async (i) => {
    const dogma = (await esi.dogma.getDogmaDynamicItemsTypeIdItemId(i.item_id, i.type_id)).data
    // console.log('i.dogma', i, i.itemID, i.typeID, i.dogma)
    const filteredAttributesObject = dogmaToAttributesRaw(i.type_id, dogma.dogma_attributes)

    const data = {
      itemID: i.item_id,
      typeID: i.type_id,
      sourceTypeID: dogma.source_type_id,
      mutatorTypeID: dogma.mutator_type_id,
      attributesRaw: filteredAttributesObject,
      status: 'NONE'
    }
    // TODO - Note: that attributesRaw really needs to contain the base-module values as well as the dynamic values so it's searchable in the DB
    // Update - This is set for base-module, just need to implement dynamic values
    return inventoryToInventoryCardDTO(data)
  }))
  console.log('inventory', inventory)

  inventory.sort((a, b) => naturalSort()(a.typeName, b.typeName) || a.itemID - b.itemID)

  const currentInventory = await getCurrentSellerInventory()
  for (const inventoryItem of inventory) {
    for (const currentInventoryItem of currentInventory) {
      if (inventoryItem.itemID === currentInventoryItem.itemID) {
        inventoryItem.status = currentInventoryItem.status
        inventoryItem.appraisal = currentInventoryItem.appraisal
        inventoryItem.listingPrice = currentInventoryItem.listingPrice
        console.log('currentInventoryItem', inventoryItem, currentInventoryItem)
      }
    }
  }

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
