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

  console.log('sde', sde)
  inventory = await Promise.all(inventory.map(async (i) => {
    i.itemId = i.item_id
    delete i.item_id
    i.typeId = i.type_id
    delete i.type_id

    i.dogma = (await esi.dogma.getDogmaDynamicItemsTypeIdItemId(i.itemId, i.typeId)).data
    // console.log('i.dogma', i, i.itemId, i.typeId, i.dogma)

    return inventoryToInventoryCardDTO(i)
  }))
  console.log('inventory', inventory)

  const currentInventory = await getCurrentSellerInventory()
  for (const inventoryItem of inventory) {
    for (const currentInventoryItem of currentInventory) {
      if (inventoryItem.itemId === currentInventoryItem.itemId) {
        inventoryItem.status = currentInventoryItem.status
        inventoryItem.appraisal = currentInventoryItem.appraisal
        inventoryItem.listingPrice = currentInventoryItem.listingPrice
        // console.log('currentInventoryItem', inventoryItem, currentInventoryItem)
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
