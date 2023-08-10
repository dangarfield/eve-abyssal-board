import { Api } from 'eve-esi-swaggerts'
import { getCurrentUserAccessToken, refreshTokenAndGetNewUserAccessToken } from './auth'
import { getAbyssModuleTypes, getAbyssModuleTypesFlatIds, getRelevantDogmaAttributesForTypeId, getUnitStringForUnitId } from './module-types'
import sde from './generated-data/sde.json'
import { getCurrentSellerInventory } from './board-api'

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
  const abyssModuleTypes = getAbyssModuleTypes()
  inventory = inventory.filter(i => abyssTypesFlat.includes(i.type_id) && i.location_flag === 'Hangar')

  console.log('sde', sde)
  inventory = await Promise.all(inventory.map(async (i) => {
    i.itemId = i.item_id
    delete i.item_id
    i.typeId = i.type_id
    delete i.type_id

    i.dogma = (await esi.dogma.getDogmaDynamicItemsTypeIdItemId(i.itemId, i.typeId)).data
    for (const dogmaAttributeHolder of i.dogma.dogma_attributes) {
      const dogmaAttributeId = dogmaAttributeHolder.attribute_id
      dogmaAttributeHolder.attribute = sde.dogmaAttributes[dogmaAttributeId]
    }
    for (const dogmaEffectHolder of i.dogma.dogma_effects) {
      const dogmaEffectId = dogmaEffectHolder.effect_id
      dogmaEffectHolder.effect = sde.dogmaEffects[dogmaEffectId]
    }
    i.typeName = sde.itemData[i.typeId].name
    i.sourceTypeId = i.dogma.source_type_id
    i.sourceTypeName = sde.itemData[i.dogma.source_type_id].name
    i.mutatorTypeId = i.dogma.mutator_type_id
    i.mutatorTypeName = sde.itemData[i.dogma.mutator_type_id].name
    const mutator = sde.itemData[i.dogma.mutator_type_id]
    i.mutatorAttributes = sde.mutatorAttributes[i.dogma.mutator_type_id]
    const source = sde.itemData[i.dogma.source_type_id]
    if (i.itemId === 1042529492556) {
      console.log('item', i.typeId, i.typeName, '-', i.mutatorTypeId, i.mutatorTypeName, mutator, '-', i.sourceTypeId, i.sourceTypeName, source)
    }

    for (const abyssModuleGroup of abyssModuleTypes) {
      for (const abyssModuleCategory of abyssModuleGroup.categories) {
        if (i.typeId === abyssModuleCategory.typeId) {
          i.abyssalModuleGroup = abyssModuleGroup.group
          i.abyssalModuleCategory = abyssModuleCategory.categoryName
        }
      }
    }

    i.attributes = getRelevantDogmaAttributesForTypeId(i.typeId + '').map(dogmaAttributeId => {
      const dogmaAttributeHolder = i.dogma.dogma_attributes.find(d => d.attribute_id === dogmaAttributeId)
      //   console.log('dogmaAttributeHolder', i.type_id, i, dogmaAttributeId, dogmaAttributeHolder)
      if (dogmaAttributeHolder === undefined || dogmaAttributeHolder.attribute === undefined) return null // TODO - It seems as though this fixed list is wrong
      const dogmaAttribute = dogmaAttributeHolder.attribute
      const sourceBaseValue = sde.itemData[i.sourceTypeId].dogmaAttributes[dogmaAttributeId]
      const unit = getUnitStringForUnitId(dogmaAttribute.unitID)
      //   const sourceValue = dogmaAttributeHolder.attribute.highIsGood && unit === '%' ? sourceBaseValue : (100 * (1 - sourceBaseValue))
      //   const value = dogmaAttributeHolder.attribute.highIsGood && unit === '%' ? dogmaAttributeHolder.value : (100 * (1 - dogmaAttributeHolder.value))

      let sourceValue = sourceBaseValue
      let value = dogmaAttributeHolder.value
      let diff = dogmaAttributeHolder.value - sourceValue
      const minPercent = dogmaAttribute.highIsGood ? i.mutatorAttributes.attributeIDs[dogmaAttributeId].min : i.mutatorAttributes.attributeIDs[dogmaAttributeId].max
      const maxPercent = dogmaAttribute.highIsGood ? i.mutatorAttributes.attributeIDs[dogmaAttributeId].max : i.mutatorAttributes.attributeIDs[dogmaAttributeId].min
      let min = sourceValue * minPercent
      let max = sourceValue * maxPercent

      //   if (i.itemId === 1042529492556) {
      //     console.log('item', i.itemId, dogmaAttributeHolder, value, sourceValue, diff, unit, dogmaAttributeHolder.attribute.highIsGood)
      //   }
      const isGood = (diff > 0) === dogmaAttributeHolder.attribute.highIsGood
      if (unit === '%') {
        sourceValue = 100 * (1 - sourceBaseValue)
        value = 100 * (1 - dogmaAttributeHolder.value)
        min = 100 * (1 - (sourceBaseValue * minPercent))
        max = 100 * (1 - (sourceBaseValue * maxPercent))
        if (dogmaAttributeHolder.attribute.highIsGood) {
          sourceValue = sourceValue * -1
          value = value * -1
          min = min * -1
          max = max * -1
        }
        diff = value - (sourceValue * 1)

        // console.log('update', value, sourceValue, diff, unit)
      }

      const obj = {
        attributeId: dogmaAttributeId,
        dogmaAttribute,
        attributeName: dogmaAttribute.displayName,
        iconID: dogmaAttribute.iconID,
        unitID: dogmaAttribute.unitID, // TODO - Get unit
        unit,
        highIsGood: dogmaAttribute.highIsGood,
        value,
        sourceValue,
        diff,
        isGood,
        minPercent,
        maxPercent,
        min,
        max
        // https://github.com/stephenswat/eve-abyssal-market/blob/0ef588480f7a4fbe70c4fa1c68a0e8c5d9c99700/abyssal_modules/models/mutators.py
        // TODO, min and max from mutators - https://github.com/stephenswat/eve-abyssal-market/blob/0ef588480f7a4fbe70c4fa1c68a0e8c5d9c99700/abyssal_modules/management/commands/get_abyssal_types.py#L94
      }
      return obj
    }).filter(i => i !== null).sort((a, b) => a.attributeName.localeCompare(b.attributeName))
    // TODO Add mutator and source type
    return i
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
