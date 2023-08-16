import sde from './generated-data/sde.json'
import { cloneSimpleList, deepCopy } from './utils'

export const inventoryToInventoryCardDTO = (data) => {
  const dataCopy = deepCopy(data)
  data.data = dataCopy
  const abyssalTypeData = sde.abyssalTypes[data.typeID]
  const mutator = abyssalTypeData.mutators[data.mutatorTypeID]
  const source = abyssalTypeData.sources[data.sourceTypeID]
  // console.log('abyssalTypeData', abyssalTypeData, mutator, source)

  data.attributes = cloneSimpleList(abyssalTypeData.attributes)
  // console.log('data.attributes', data.attributes)
  for (const attribute of data.attributes) {
  // for (const attribute of data.attributes.filter(a => a.type === 'mutation')) {
    // const attribute = data.attributes.find(a => a.id === parseInt(attributeId))
    if (attribute.type === 'mutation') {
      attribute.value = data.attributesRaw[attribute.id]
      attribute.sourceValue = source.attributes[attribute.id]
      attribute.diff = attribute.value - attribute.sourceValue
      attribute.isGood = (attribute.diff > 0) === attribute.highIsGood
      // if (attribute.type === 'mutation') {
      attribute.mutationMin = attribute.sourceValue * (attribute.isGood ? mutator.mutationValues[attribute.id].max : mutator.mutationValues[attribute.id].min)
      attribute.mutationMax = attribute.sourceValue * (attribute.isGood ? mutator.mutationValues[attribute.id].min : mutator.mutationValues[attribute.id].max)
      attribute.zeroDiff = Math.abs((attribute.highIsGood ? attribute.mutationMin : attribute.mutationMax) - attribute.sourceValue)
      attribute.perc = Math.round(100 * (Math.abs(attribute.diff) / attribute.zeroDiff))
      // }
      attribute.allDiff = attribute.value - attribute.allComparisonZero
      attribute.allIsGood = (attribute.allDiff > 0) === attribute.highIsGood
      attribute.allMin = attribute.isGood ? attribute.allMax : attribute.allMin
      attribute.allMax = attribute.isGood ? attribute.allMin : attribute.allMax
      attribute.allZeroDiff = Math.abs((attribute.highIsGood ? attribute.allMin : attribute.allMax) - attribute.allComparisonZero)
      attribute.allPerc = Math.round(100 * (Math.abs(attribute.allDiff) / attribute.allZeroDiff))
    }
    if (attribute.type === 'base-module') {
      attribute.value = data.attributesRaw[attribute.id]
      attribute.sourceValue = attribute.allComparisonZero
      attribute.diff = attribute.value - attribute.allComparisonZero
      attribute.isGood = (attribute.diff > 0) === attribute.highIsGood

      attribute.min = attribute.isGood ? attribute.allSourcesMax : attribute.allSourcesMin
      attribute.max = attribute.isGood ? attribute.allSourcesMin : attribute.allSourcesMax
      attribute.zeroDiff = Math.abs((attribute.highIsGood ? attribute.allSourcesMin : attribute.allSourcesMax) - attribute.allComparisonZero)
      attribute.perc = Math.round(100 * (Math.abs(attribute.diff) / attribute.zeroDiff))
    }
  }
  data.attributes.sort((a, b) => a.name.localeCompare(b.name))
  data.baseAttributes = []

  data.typeName = abyssalTypeData.name
  data.group = abyssalTypeData.group
  data.category = abyssalTypeData.category

  data.mutatorTypeName = mutator.name
  data.sourceTypeName = source.name

  return data
}
