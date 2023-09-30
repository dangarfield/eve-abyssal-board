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
  let { characterId, accessToken } = await getCurrentUserAccessToken()

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
      const userDetails = await getCurrentUserAccessToken()
      accessToken = userDetails.accessToken
    }
  } while (pagesFetched < maxPage)

  const abyssTypesFlat = getAbyssModuleTypesFlatIds()
  console.log('abyssTypesFlat', abyssTypesFlat)
  // const abyssModuleTypes = getAbyssModuleTypes()
  console.log('alsalaw debug', inventory.filter(i => abyssTypesFlat.includes(i.type_id)).map(i => `${i.item_id} - ${i.type_id} - ${i.location_id} - ${i.location_flag}`))
  inventory = inventory.filter(i => abyssTypesFlat.includes(i.type_id) && ['Hangar', 'Cargo', 'AutoFit', 'Unlocked'].includes(i.location_flag))

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
