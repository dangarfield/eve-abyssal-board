import sde from './generated-data/sde.json'
import { getAbyssModuleTypes, getUnitStringForUnitId } from './module-types'

export const getUnitForDogma = (id) => {
  const unit = getUnitStringForUnitId(sde.dogmaAttributes[id].unitID)
  return unit
}

export const inventoryToInventoryCardDTO = (i) => {
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
  i.mutatorAttributes = sde.mutatorAttributes[i.dogma.mutator_type_id]

  i.baseAttributes = []
  if (sde.dynamicAttributes[i.typeId] && sde.dynamicAttributes[i.typeId].baseModuleAttributes) {
    // console.log('sde.dynamicAttributes[i.typeId].baseModuleAttributes', sde.dynamicAttributes[i.typeId].baseModuleAttributes, sde.itemData[i.typeId])
    for (const attributeId in sde.dynamicAttributes[i.typeId].baseModuleAttributes) {
      const sourceAttribute = sde.dynamicAttributes[i.typeId].baseModuleAttributes[attributeId]

      sourceAttribute.attributeId = parseInt(attributeId)
      const dogmaAttribute = sde.dogmaAttributes[attributeId]

      sourceAttribute.unitID = getUnitForDogma(sourceAttribute.attributeId)
      sourceAttribute.displayName = dogmaAttribute.displayName
      sourceAttribute.iconID = dogmaAttribute.iconID
      sourceAttribute.value = sde.itemData[i.sourceTypeId].baseModuleAttributes[sourceAttribute.attributeId]
      // console.log('sourceAttribute', sourceAttribute, attributeId)
      i.baseAttributes.push(sourceAttribute)
    }
  }

  // if (i.itemId === 1042480147975) {
  //   // const baseModuleAttributeIDs = Object.keys(source.baseModuleAttributes).map(i => parseInt(i))
  //   console.log('item', i, i.typeId, i.typeName, '-', i.mutatorTypeId, i.mutatorTypeName, mutator, '-', i.sourceTypeId, i.sourceTypeName, source, sde.itemData[i.sourceTypeId].value)
  //   // console.log('baseModuleAttributeIDs', baseModuleAttributeIDs)
  // }

  for (const abyssModuleGroup of getAbyssModuleTypes()) {
    for (const abyssModuleCategory of abyssModuleGroup.categories) {
      if (i.typeId === abyssModuleCategory.typeId) {
        i.abyssalModuleGroup = abyssModuleGroup.group
        i.abyssalModuleCategory = abyssModuleCategory.categoryName
      }
    }
  }

  i.attributes = sde.abyssalTypes[i.typeId].attributes.map(dogmaAttributeId => {
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
    // console.log('i.mutatorAttributes.attributeIDs[dogmaAttributeId]', i, dogmaAttributeId, i.mutatorAttributes.attributeIDs[dogmaAttributeId])
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
  return i
}
