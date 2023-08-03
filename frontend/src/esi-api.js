import { Api } from 'eve-esi-swaggerts'
import { getCurrentUserAccessToken, refreshTokenAndGetNewUserAccessToken } from './auth'
import { getAbyssModuleTypesFlatIds, getRelevantDogmaAttributesForTypeId } from './module-types'
import sde from './generated-data/sde.json'

const esi = new Api()

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

  const abyssTypes = getAbyssModuleTypesFlatIds()
  console.log('abyssTypes', abyssTypes)

  inventory = inventory.filter(i => abyssTypes.includes(i.type_id) && i.location_flag === 'Hangar')

  console.log('sde', sde)
  inventory = await Promise.all(inventory.map(async (i) => {
    i.dogma = (await esi.dogma.getDogmaDynamicItemsTypeIdItemId(i.item_id, i.type_id)).data
    for (const dogmaAttributeHolder of i.dogma.dogma_attributes) {
      const dogmaAttributeId = dogmaAttributeHolder.attribute_id
      dogmaAttributeHolder.attribute = sde.dogmaAttributes[dogmaAttributeId]
    }
    for (const dogmaEffectHolder of i.dogma.dogma_effects) {
      const dogmaEffectId = dogmaEffectHolder.effect_id
      dogmaEffectHolder.effect = sde.dogmaEffects[dogmaEffectId]
    }
    i.typeName = sde.itemNames[i.type_id]
    i.sourceTypeId = i.dogma.source_type_id
    i.sourceTypeName = sde.itemNames[i.dogma.source_type_id]
    i.mutatorTypeId = i.dogma.mutator_type_id
    i.mutatorTypeName = sde.itemNames[i.dogma.mutator_type_id]
    i.relevantDogmaAttributes = getRelevantDogmaAttributesForTypeId(i.type_id + '').map(dogmaAttributeId => {
      const dogmaAttributeHolder = i.dogma.dogma_attributes.find(d => d.attribute_id === dogmaAttributeId)
      //   console.log('dogmaAttributeHolder', i.type_id, i, dogmaAttributeId, dogmaAttributeHolder)
      if (dogmaAttributeHolder === undefined || dogmaAttributeHolder.attribute === undefined) return null // TODO - It seems as though this fixed list is wrong
      const dogmaAttribute = dogmaAttributeHolder.attribute
      const sourceValue = 100
      const diff = sourceValue - dogmaAttributeHolder.value
      const obj = {
        id: dogmaAttributeId,
        dogmaAttribute,
        name: dogmaAttribute.displayName,
        iconID: dogmaAttribute.iconID,
        unitID: dogmaAttribute.unitID, // TODO - Get unit
        highIsGood: dogmaAttribute.highIsGood,
        value: dogmaAttributeHolder.value,
        sourceValue: 100,
        diff
        // TODO, min and max from mutators - https://github.com/stephenswat/eve-abyssal-market/blob/0ef588480f7a4fbe70c4fa1c68a0e8c5d9c99700/abyssal_modules/management/commands/get_abyssal_types.py#L94
      }
      return obj
    }).filter(i => i !== null).sort((a, b) => a.name.localeCompare(b.name))
    // TODO Add mutator and source type
    return i
  }))
  console.log('inventory', inventory)

  // TODO - Add full data
  // TODO - Render properly
  // TODO - Highligh already listed items
  return { inventory, cacheExpires, lastModified }
}

// List of modules
// https://github.com/stephenswat/eve-abyssal-market/blob/master/abyssal_modules/models/modules.py
