import { Api } from 'eve-esi-swaggerts'
import { getCurrentUserAccessToken, refreshTokenAndGetNewUserAccessToken } from './auth'
import { getAbyssModuleTypesFlatIds, getRelevantDogmaAttributesForTypeId, getUnitStringForUnitId } from './module-types'
import sde from './generated-data/sde.json'

const esi = new Api()

/*
Eve mail
  "body": "<font size=\"14\" color=\"#bfffffff\">Thanks for choosing Abyss Board.<br><br>You have listed 3 items.<br>Listing payment is 30m ISK.<br>Right click on this </font><font size=\"14\" color=\"#ffd98d00\"><a href=\"showinfo:2//98746847\">Seph Corp</a></font><font size=\"14\" color=\"#bfffffff\"> and click 'Give Money'.<br><br>Fill in the details as follows:<br><br><b>Account</b>: Abyss Board Income<br><b>Amount</b>: 30000000<br><b>Reason</b>: abc123<br><br><br>Please be careful to fill this information in carefully.<br>It may take up to 1 hour for the transation to be registered and your items listed.<br><br>For any specific questions, contact us on </font><font size=\"14\" color=\"#ffffe400\"><loc><a href=\"http://discord/asfdsadsad\">discord</a></loc></font><font size=\"14\" color=\"#bfffffff\">.<br><br>Thanks</font>",
*/
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
    i.typeName = sde.itemData[i.type_id].name
    i.sourceTypeId = i.dogma.source_type_id
    i.sourceTypeName = sde.itemData[i.dogma.source_type_id].name
    i.mutatorTypeId = i.dogma.mutator_type_id
    i.mutatorTypeName = sde.itemData[i.dogma.mutator_type_id].name
    const mutator = sde.itemData[i.dogma.mutator_type_id]
    i.mutatorAttributes = sde.mutatorAttributes[i.dogma.mutator_type_id]
    const source = sde.itemData[i.dogma.source_type_id]
    if (i.item_id === 1042529492556) {
      console.log('item', i.type_id, i.typeName, '-', i.mutatorTypeId, i.mutatorTypeName, mutator, '-', i.sourceTypeId, i.sourceTypeName, source)
    }

    i.relevantDogmaAttributes = getRelevantDogmaAttributesForTypeId(i.type_id + '').map(dogmaAttributeId => {
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

      //   if (i.item_id === 1042529492556) {
      //     console.log('item', i.item_id, dogmaAttributeHolder, value, sourceValue, diff, unit, dogmaAttributeHolder.attribute.highIsGood)
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
        id: dogmaAttributeId,
        dogmaAttribute,
        name: dogmaAttribute.displayName,
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
