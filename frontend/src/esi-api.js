import { Api } from 'eve-esi-swaggerts'
import { getCurrentUserAccessToken, refreshTokenAndGetNewUserAccessToken } from './auth'
import { getAbyssModuleTypesFlatIds } from './module-types'
import sde from './generated-data/sde.json'
import { getCurrentSellerInventory } from './board-api'
import { inventoryToInventoryCardDTO } from './dogma-utils'

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

  // .filter(i => i.item_id === 1042480142523)
  // .filter(i => i.item_id === 1037021119109)
  // .filter(i => i.type_id === 47769)

  inventory.sort((a, b) => a.item_id - b.item_id)
  console.log('sde', sde)
  inventory = await Promise.all(inventory.map(async (i) => {
    const dogma = (await esi.dogma.getDogmaDynamicItemsTypeIdItemId(i.item_id, i.type_id)).data
    // console.log('i.dogma', i, i.itemID, i.typeID, i.dogma)
    const relevantAttributes = sde.abyssalTypes[i.type_id].attributes.map(a => a.id)
    const filteredAttributes = dogma.dogma_attributes.filter(attr => relevantAttributes.includes(attr.attribute_id))// .map(a => { return { id: a.attribute_id, value: a.value } })
    const filteredAttributesObject = filteredAttributes.reduce((acc, attr) => {
      acc[attr.attribute_id] = attr.value
      return acc
    }, {})

    const data = {
      itemID: i.item_id,
      typeID: i.type_id,
      sourceTypeID: dogma.source_type_id,
      mutatorTypeID: dogma.mutator_type_id,
      attributesRaw: filteredAttributesObject,
      status: 'NONE'
    }

    return inventoryToInventoryCardDTO(data)
  }))
  console.log('inventory', inventory)

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
