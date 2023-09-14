/* eslint-disable camelcase */
import axios from 'axios'
import AdmZip from 'adm-zip'
import yaml from 'js-yaml'

import fs from 'fs'
import path from 'path'
import { evaluate } from 'mathjs'
import { getAbyssModuleTypes } from './frontend/src/module-types.js'

const SDE_URL = 'https://eve-static-data-export.s3-eu-west-1.amazonaws.com/tranquility/sde.zip'
const SDE_ICONS_URL = 'https://web.ccpgamescdn.com/aws/developers/Uprising_V21.03_Icons.zip'
const SDE_TYPES_URL = 'https://web.ccpgamescdn.com/aws/developers/Uprising_V21.03_Types.zip'
const DYN_ATTRS_URL = 'https://sde.hoboleaks.space/tq/dynamicitemattributes.json'

const moduleTypes = getAbyssModuleTypes()

const yamlToJson = (filePath) => {
  return yaml.load(fs.readFileSync(filePath, 'utf-8'))
}
const downloadJson = async (url, folder) => {
  const fileName = path.basename(url)
  const filePath = path.join(folder, fileName)
  if (fs.existsSync(filePath)) return
  const data = (await axios.get(url)).data
  console.log('downloadJson', fileName, url, filePath)
  fs.writeFileSync(filePath, JSON.stringify(data))
}
const downloadAndUnzip = async (url, unzipPath, folderName) => {
  try {
    const unzipPathPath = path.join(unzipPath)
    if (!fs.existsSync(unzipPathPath)) fs.mkdirSync(unzipPathPath)
    console.log('downloadAndUnzip', url, unzipPath, folderName)
    if (fs.existsSync(path.join(unzipPath, folderName))) return
    // if (fs.readdirSync(unzipPathPath).length > 0) return
    console.log('downloadAndUnzip', url, unzipPath, folderName)
    const response = await axios.get(url, { responseType: 'stream' })
    const zipFileName = path.basename(url)
    const zipFilePath = path.join(unzipPath, zipFileName)

    response.data.pipe(fs.createWriteStream(zipFilePath))

    await new Promise((resolve, reject) => {
      response.data.on('end', resolve)
      response.data.on('error', reject)
    })

    await fs.promises.mkdir(unzipPath, { recursive: true })

    const zip = new AdmZip(zipFilePath)
    zip.extractAllTo(unzipPath, true)

    fs.unlinkSync(zipFilePath) // Remove the downloaded zip file

    console.log('Download and unzip successful!')
    console.log('fs.readdirSync(unzipPathPath)', fs.readdirSync(unzipPathPath))
  } catch (error) {
    console.error('Error:', error.message)
  }
}

const saveRequiredData = async (items) => {
  fs.writeFileSync('./frontend/src/generated-data/sde.json', JSON.stringify(items))
}
export const getAllRelevantDogmaAttributes = (mutatorAttributes) => {
  const uniqueIntegers = new Set()
  for (const attributeName in mutatorAttributes) {
    const attribute = mutatorAttributes[attributeName]
    for (const attributeID in attribute.attributeIDs) {
      uniqueIntegers.add(parseInt(attributeID))
    }
  }
  const u = Array.from(uniqueIntegers)
  u.sort((a, b) => a - b)
  return u
}
const getRelevantDogmaAttributesForTypeId = (mutatorAttributes, type) => {
  for (const attributeName in mutatorAttributes) {
    const attribute = mutatorAttributes[attributeName]
    if (attribute.inputOutputMapping.resultingType === type) {
      const keys = Object.keys(attribute.attributeIDs).map(i => { return { id: parseInt(i), type: 'mutation' } })
      keys.sort((a, b) => a - b)
      return keys
    }
  }
  return null
}
// const getAbyssalTypeForSourceTypeId = (mutatorAttributes, type) => {
//   for (const attributeName in mutatorAttributes) {
//     const attribute = mutatorAttributes[attributeName]
//     if (attribute.inputOutputMapping.applicableTypes.includes(type)) {
//       return attribute.inputOutputMapping.resultingType
//     }
//   }
//   return null
// }
const setBaseModelAttribute = (mutatorAttributes, typeDogmas, dogmaAttributes, dynamicAttributes, abyssalItemId, attributeId) => {
  for (const attributeName in mutatorAttributes) {
    const attribute = mutatorAttributes[attributeName]
    if (attribute.inputOutputMapping.resultingType === abyssalItemId) {
      const applicableTypeValues = attribute.inputOutputMapping.applicableTypes.map(t => typeDogmas[t].dogmaAttributes.find(a => a.attributeID === attributeId).value)
      const highIsGood = dogmaAttributes[attributeId].highIsGood
      const min = highIsGood ? Math.min(...applicableTypeValues) : Math.max(...applicableTypeValues)
      const max = highIsGood ? Math.max(...applicableTypeValues) : Math.min(...applicableTypeValues)

      if (dynamicAttributes[abyssalItemId] === undefined) dynamicAttributes[abyssalItemId] = {}
      if (dynamicAttributes[abyssalItemId].baseModuleAttributes === undefined) dynamicAttributes[abyssalItemId].baseModuleAttributes = {}
      dynamicAttributes[abyssalItemId].baseModuleAttributes[attributeId] = { min, max, highIsGood }
      // if (attributeId === 30) {
      //   console.log('setBaseModelAttribute', attributeId, applicableTypeValues, attribute.inputOutputMapping.applicableTypes, min, max, highIsGood)
      // }

      return { min, max, highIsGood }
    }
  }
  return null
}
// const setMutaAttributes = (mutatorAttributes, typeDogmas, dogmaAttributes) => {

// }
const updateDynamicAttributes = (mutatorAttributes, typeDogmas, dogmaAttributes, types) => {
  const dynamicAttributes = {}
  for (const attributeId in mutatorAttributes) {
    const attribute = mutatorAttributes[attributeId]
    attribute.inputOutputMapping = attribute.inputOutputMapping[0]
  }

  // Are these all muta change attributes that were removed from the game at some point?!

  // // attr 47740 [ 6, 20, 30, 50, 147, 554 ] [ 6, 20, 30, 50, 554 ] false - 147
  setBaseModelAttribute(mutatorAttributes, typeDogmas, dogmaAttributes, dynamicAttributes, 47740, 147) // 5MN Microwarpdrive
  // // attr 47408 [ 6, 20, 30, 50, 147, 554 ] [ 6, 20, 30, 50, 554 ] false - 147
  setBaseModelAttribute(mutatorAttributes, typeDogmas, dogmaAttributes, dynamicAttributes, 47408, 147) // 50MN Microwarpdrive
  // // attr 47745 [ 6, 20, 30, 50, 147, 554 ] [ 6, 20, 30, 50, 554 ] false - 147
  setBaseModelAttribute(mutatorAttributes, typeDogmas, dogmaAttributes, dynamicAttributes, 47745, 147) // 500MN Microwarpdrive
  // // attr 56306 [ 6, 20, 30, 50, 147, 554 ] [ 6, 20, 30, 50, 554 ] false - 147
  setBaseModelAttribute(mutatorAttributes, typeDogmas, dogmaAttributes, dynamicAttributes, 56306, 147) // 5000MN Microwarpdrive

  // // attr 47824 [ 6, 30, 50, 54, 97, 2044 ] [ 6, 30, 50, 54, 97 ] false - 2044
  setBaseModelAttribute(mutatorAttributes, typeDogmas, dogmaAttributes, dynamicAttributes, 47824, 2044) // Small Energy Neutralizer
  // // attr 47828 [ 6, 30, 50, 54, 97, 2044 ] [ 6, 30, 50, 54, 97 ] false - 2044
  setBaseModelAttribute(mutatorAttributes, typeDogmas, dogmaAttributes, dynamicAttributes, 47828, 2044) // Small Energy Neutralizer
  // // attr 47832 [ 6, 30, 50, 54, 97, 2044 ] [ 6, 30, 50, 54, 97 ] false - 2044
  setBaseModelAttribute(mutatorAttributes, typeDogmas, dogmaAttributes, dynamicAttributes, 47832, 2044) // Small Energy Neutralizer
  // // attr 56312 [ 6, 30, 50, 54, 97, 2044 ] [ 6, 30, 50, 54, 97 ] false - 2044
  setBaseModelAttribute(mutatorAttributes, typeDogmas, dogmaAttributes, dynamicAttributes, 56312, 2044) // Capital Energy Neutralizer

  // // attr 48419 [ 30, 50, 54, 90, 2044 ] [ 30, 50, 54, 90 ] false - 2044
  setBaseModelAttribute(mutatorAttributes, typeDogmas, dogmaAttributes, dynamicAttributes, 48419, 2044) // Small Energy Nosferatu
  // // attr 48423 [ 30, 50, 54, 90, 2044 ] [ 30, 50, 54, 90 ] false - 2044
  setBaseModelAttribute(mutatorAttributes, typeDogmas, dogmaAttributes, dynamicAttributes, 48423, 2044) // Medium Energy Nosferatu
  // // attr 48427 [ 30, 50, 54, 90, 2044 ] [ 30, 50, 54, 90 ] false - 2044
  setBaseModelAttribute(mutatorAttributes, typeDogmas, dogmaAttributes, dynamicAttributes, 48427, 2044) // Heavy Energy Nosferatu
  // // attr 56311 [ 30, 50, 54, 90, 2044 ] [ 30, 50, 54, 90 ] false - 2044
  setBaseModelAttribute(mutatorAttributes, typeDogmas, dogmaAttributes, dynamicAttributes, 56311, 2044) // Capital Energy Nosferatu

  // // attr 47732 [ 6, 50, 54, 105 ] [ 6, 50, 54 ] false - 105
  setBaseModelAttribute(mutatorAttributes, typeDogmas, dogmaAttributes, dynamicAttributes, 47732, 105) // Warp Scrambler
  // // attr 56303 [ 6, 50, 54, 105 ] [ 6, 50, 54 ] false - 105
  setBaseModelAttribute(mutatorAttributes, typeDogmas, dogmaAttributes, dynamicAttributes, 56303, 105) // Heavy Warp Scrambler

  // // attr 47702 [ 6, 20, 30, 50, 54 ] [ 6, 20, 50, 54 ] false - 30
  setBaseModelAttribute(mutatorAttributes, typeDogmas, dogmaAttributes, dynamicAttributes, 47702, 30) // Stasis Webifier

  return dynamicAttributes
}
const updateBaseModuleAttributes = (attributes, typeID) => {
  if (typeID === 47740) attributes.push({ id: 147, type: 'base-module' }) // 5MN Microwarpdrive
  if (typeID === 47408) attributes.push({ id: 147, type: 'base-module' }) // 50MN Microwarpdrive
  if (typeID === 47745) attributes.push({ id: 147, type: 'base-module' }) // 500MN Microwarpdrive
  if (typeID === 56306) attributes.push({ id: 147, type: 'base-module' }) // 5000MN Microwarpdrive

  if (typeID === 47824) attributes.push({ id: 2044, type: 'base-module' }) // Small Energy Neutralizer
  if (typeID === 47828) attributes.push({ id: 2044, type: 'base-module' }) // Medium Energy Neutralizer
  if (typeID === 47832) attributes.push({ id: 2044, type: 'base-module' }) // Large Energy Neutralizer
  if (typeID === 56312) attributes.push({ id: 2044, type: 'base-module' }) // Capital Energy Neutralizer

  if (typeID === 48419) attributes.push({ id: 2044, type: 'base-module' }) // Small Energy Nosferatu
  if (typeID === 48423) attributes.push({ id: 2044, type: 'base-module' }) // Medium Energy Nosferatu
  if (typeID === 48427) attributes.push({ id: 2044, type: 'base-module' }) // Large Energy Nosferatu
  if (typeID === 56311) attributes.push({ id: 2044, type: 'base-module' }) // Capital Energy Nosferatu

  if (typeID === 47732) attributes.push({ id: 105, type: 'base-module' }) // Warp Scrambler
  if (typeID === 56303) attributes.push({ id: 105, type: 'base-module' }) // Heavy Warp Scrambler

  if (typeID === 47702) attributes.push({ id: 30, type: 'base-module' }) // Stasis Webifier
}
function addAttribute (attributes, id, type, name, unitID, iconID, highIsGood, valueExpression) {
  attributes.push({
    id,
    type,
    name,
    unitID,
    iconID,
    highIsGood,
    valueExpression
  })
}

const updateDerivedAttributes = (attributes, typeID) => {
  // For each group of typeIds, add the corresponding attributes
  if ([47781, 47785, 47789, 47793, 47836, 47838, 47840, 56309, 56310].includes(typeID)) {
    addAttribute(attributes, 100000, 'derived', 'Shield boost per second', 1001, 84, true, 'getValue(68) / getValue(73)') // HP/s
  }

  if ([47769, 47773, 47777, 47842, 47844, 47846, 56307, 56308].includes(typeID)) {
    addAttribute(attributes, 100001, 'derived', 'Armor repair per second', 1001, 84, true, '(getValue(84) / getValue(73)) * 1000') // HP/s
  }

  if ([47781, 47785, 47789, 47793, 56309, 56310].includes(typeID)) {
    addAttribute(attributes, 100002, 'derived', 'Shield boost per capacitor', 1002, 1031, true, 'getValue(68) / getValue(6)') // HP/GJ
  }

  if ([47769, 47773, 47777, 47842, 47844, 47846, 56307, 56308].includes(typeID)) {
    addAttribute(attributes, 100003, 'derived', 'Armor repair per capacitor', 1002, 1031, true, 'getValue(84) / getValue(6)') // HP/GJ
  }

  if ([49730, 49722, 49726, 49734].includes(typeID)) {
    addAttribute(attributes, 100004, 'derived', 'DPS Bonus', 1003, 2893, true, '((getValue(64) / getValue(204)) -1)*100') // %
  }

  if ([49738].includes(typeID)) {
    addAttribute(attributes, 100005, 'derived', 'DPS Bonus', 1003, 2893, true, '((getValue(213) / getValue(204)) -1)*100') // %
  }
}
const getDisplayGroupCategoryForAbyssItemType = (typeID) => {
  for (const moduleType of moduleTypes) {
    for (const category of moduleType.categories) {
      if (category.typeID === typeID) return { group: moduleType.group, category: category.categoryName }
    }
  }
  return {}
}
const getMutatorsAndSourcesForAbyssItem = (mutatorAttributes, types, typeDogmas, metaGroups, attributes, typeID) => {
  const mutators = {}
  const sources = {}
  for (const mutatorIdString in mutatorAttributes) {
    const mutatorConfig = mutatorAttributes[mutatorIdString]
    if (mutatorConfig.inputOutputMapping.resultingType === typeID) {
      const mutator = {}
      const mutatorId = parseInt(mutatorIdString)
      // mutator.id = mutatorId
      mutator.name = types[mutatorId].name.en
      mutator.iconID = types[mutatorId].iconID
      // mutator.data = mutatorConfig
      mutator.mutationValues = mutatorConfig.attributeIDs

      for (const sourceTypeId of mutatorConfig.inputOutputMapping.applicableTypes) {
        if (!sources[sourceTypeId]) {
          const sourceValues = {}
          // TODO add non-mutation attributes in here too. Should be working though
          for (const attribute of attributes) {
            // console.log('attribute', attribute)
            if (attribute.type === 'derived') {
              const dogmaAttributes = typeDogmas[sourceTypeId].dogmaAttributes.reduce((acc, obj) => ({ ...acc, [obj.attributeID]: obj.value }), {})
              const value = evaluate(attribute.valueExpression, { getValue: valueID => dogmaAttributes[valueID] })
              // console.log('attribute', attribute, attribute.valueExpression, dogmaAttributes, dogmaAttributes[68], dogmaAttributes[6], value)
              sourceValues[attribute.id] = value
            } else {
              sourceValues[attribute.id] = typeDogmas[sourceTypeId].dogmaAttributes.find(a => a.attributeID === attribute.id).value
            }
          }

          const metaGroup = metaGroups[types[sourceTypeId].metaGroupID]
          // console.log('metaGroup', types[sourceTypeId], types[sourceTypeId].metaGroupID, metaGroup)
          sources[sourceTypeId] = {
            name: types[sourceTypeId].name.en,
            iconID: types[sourceTypeId].iconID,
            attributes: sourceValues,
            // metaGroupIcon: metaGroups[types[sourceTypeId].metaGroupID].iconID
            metaGroupName: metaGroup !== undefined ? metaGroup.nameID.en : ''
          }
          if (metaGroup !== undefined && metaGroup.iconID) {
            sources[sourceTypeId].metaGroupIconID = metaGroup.iconID
          }
        }
      }
      mutators[mutatorId] = mutator
    }
  }
  return { mutators, sources }
}
const updateMinMaxForAbyssItemAttributes = (attributes, mutators, sources) => {
  for (const attribute of attributes.filter(a => a.type !== 'derived')) {
    const sourceValues = Object.keys(sources).map(s => sources[s].attributes[attribute.id])
    const allSourcesMin = Math.min(...sourceValues)
    const allSourcesMax = Math.max(...sourceValues)

    attribute.allSourcesMin = allSourcesMin
    attribute.allSourcesMax = allSourcesMax
    attribute.allComparisonZero = allSourcesMax - (0.5 * (allSourcesMax - allSourcesMin))
    const shouldGetMutationStats = Object.values(mutators).some(obj => obj.mutationValues[attribute.id])
    // console.log('attribute', attribute, sourceValues, sourceMin, sourceMax, shouldGetMutationStats)
    if (shouldGetMutationStats) {
      const mutatorValues = Object.keys(mutators).map(m => mutators[m].mutationValues[attribute.id])
      const mutatorHighIsGood = mutatorValues.every(v => v.highIsGood !== 0)
      const allMutatorsValuesMin = mutatorValues.map(m => m.min)
      const allMutatorsMin = Math.min(...allMutatorsValuesMin)
      const allMutatorsValuesMax = mutatorValues.map(m => m.max)
      const allMutatorsMax = Math.max(...allMutatorsValuesMax)

      const allMin = allSourcesMin * (mutatorHighIsGood ? allMutatorsMin : allMutatorsMax)
      const allMax = allSourcesMax * (mutatorHighIsGood ? allMutatorsMax : allMutatorsMin)
      // if (attribute.id === 20) { // && Object.values(sources)[0].name.includes('Webi')) {
      if (!mutatorHighIsGood) {
        console.log('mutatorValues', attribute.id, Object.values(sources)[0].name, mutatorValues, 'src', allSourcesMin, allSourcesMax, 'mut', allMutatorsMin, allMutatorsMax, '=', allMin, allMax)
      }

      // TODO - set the comparisonZero to a type specific value for officer mods etc
      const allComparisonZero = allMax - (0.5 * (allMax - allMin)) // Updates existing one if muta
      const toAdd = { allMutatorsMax, allMutatorsMin, allMin, allMax, allComparisonZero }
      for (const key in toAdd) {
        attribute[key] = toAdd[key]
      }
    } else {
      attribute.allMin = allSourcesMin
      attribute.allMax = allSourcesMax
    }
  }
}
const updateMinMaxForAbyssItemAttributesDerived = (attributes, mutators, sources) => {
  const minMaxAttrs = attributes.filter(a => a.type !== 'derived').reduce((acc, item) => ({ ...acc, [item.id]: { min: item.allMin, max: item.allMax } }), {})

  for (const attribute of attributes.filter(a => a.type === 'derived')) {
    const potentialArguments = Array.from(attribute.valueExpression.matchAll(/getValue\((\d+)\)/g), match => parseInt(match[1]))

    const resultArray = []
    const minMax = ['min', 'max']
    potentialArguments.forEach(arg1 => {
      potentialArguments.forEach(arg2 => {
        if (arg1 !== arg2 && arg1 < arg2) {
          minMax.forEach(arg3 => {
            minMax.forEach(arg4 => {
              resultArray.push({
                [arg1]: minMaxAttrs[arg1][arg3],
                [arg2]: minMaxAttrs[arg2][arg4]
              })
            })
          })
        }
      })
    })

    const allCombinationResults = resultArray.map(c => evaluate(attribute.valueExpression, { getValue: valueID => c[valueID] }))
    const allMin = Math.min(...allCombinationResults)
    const allMax = Math.max(...allCombinationResults)
    const allComparisonZero = allMax - (0.5 * (allMax - allMin))
    // console.log('resallCombinationResultsult', allCombinationResults, allMin, allMax)

    attribute.allMin = allMin
    attribute.allMax = allMax
    attribute.allComparisonZero = allComparisonZero
  }
}
const updateAttributeInfo = (dogmaAttributes, attributes) => {
  for (const attribute of attributes) {
    // attribute.data = dogmaAttributes[attribute.id]
    // attribute.dataString = JSON.stringify(dogmaAttributes[attribute.id])
    // console.log('attribute', attribute)
    if (attribute.name === undefined) attribute.name = dogmaAttributes[attribute.id].displayNameID.en
    if (attribute.iconID === undefined) attribute.iconID = dogmaAttributes[attribute.id].iconID
    if (attribute.unitID === undefined) attribute.unitID = dogmaAttributes[attribute.id].unitID
    if (attribute.highIsGood === undefined) attribute.highIsGood = dogmaAttributes[attribute.id].highIsGood
  }
}
const populateRequiredData = async () => {
  // Abyssal Types
  const types = yamlToJson('./_data/sde/fsd/typeIDs.yaml')
  // const groups = yamlToJson('./_data/sde/fsd/groupIDs.yaml')
  // const metaGroups = yamlToJson('./_data/sde/fsd/metaGroups.yaml')

  const typeDogmas = yamlToJson('./_data/sde/fsd/typeDogma.yaml')
  const dogmaAttributes = yamlToJson('./_data/sde/fsd/dogmaAttributes.yaml')
  const metaGroups = yamlToJson('./_data/sde/fsd/metaGroups.yaml')
  const mutatorAttributes = JSON.parse(fs.readFileSync('./_data/dynamicitemattributes.json', 'utf8'))

  updateDynamicAttributes(mutatorAttributes, typeDogmas, dogmaAttributes, types)

  // console.log('dynamicAttributes', dynamicAttributes)
  const abyssalTypes = Object.keys(types)
    .map((key) => {
      const type = types[key]
      type.typeID = key
      return type
    })
    .filter((item) => item.published && item.metaGroupID && item.metaGroupID === 15) // Filter items by metaGroupID
    .map((type) => {
      // const group = groups[type.groupID]
      // const metaGroup = metaGroups[type.metaGroupID]
      const typeID = parseInt(type.typeID)
      const attributes = getRelevantDogmaAttributesForTypeId(mutatorAttributes, typeID)
      updateBaseModuleAttributes(attributes, typeID)
      updateDerivedAttributes(attributes, typeID)
      const { group, category } = getDisplayGroupCategoryForAbyssItemType(typeID)
      const { mutators, sources } = getMutatorsAndSourcesForAbyssItem(mutatorAttributes, types, typeDogmas, metaGroups, attributes, typeID)
      // if (typeID === 47408) {
      // console.log('type.typeID', type.typeID)
      updateMinMaxForAbyssItemAttributes(attributes, mutators, sources)
      // }
      // if (typeID === 49730) {
      updateMinMaxForAbyssItemAttributesDerived(attributes, mutators, sources)
      // }
      updateAttributeInfo(dogmaAttributes, attributes)

      const obj = {
        typeID: parseInt(type.typeID),
        name: type.name.en,
        group,
        category,
        attributeIds: attributes.map(a => a.id),
        attributes,

        mutators,
        sources
      }
      return obj
    }).reduce((acc, item) => {
      acc[item.typeID] = item
      return acc
    }, {})

  // TODO - Validate this, but I think I've replaced all of the data required in a simpler format above in abyssalTypes

  // Dogma Attributes

  // const dogmaAttributeCategories = yamlToJson('./_data/sde/fsd/dogmaAttributeCategories.yaml')

  // for (const dogmaAttributeId in dogmaAttributes) {
  //   const dogmaAttribute = dogmaAttributes[dogmaAttributeId]
  //   const dogmaAttributeCategory = dogmaAttributeCategories[dogmaAttribute.categoryID]
  //   if (dogmaAttributeCategory) dogmaAttribute.categoryName = dogmaAttributeCategory.name
  //   if (dogmaAttribute.displayNameID) {
  //     dogmaAttribute.displayName = dogmaAttribute.displayNameID.en
  //     delete dogmaAttribute.displayNameID
  //   }
  //   if (dogmaAttribute.displayNameID) {
  //     dogmaAttribute.displayName = dogmaAttribute.displayNameID.en
  //     delete dogmaAttribute.displayNameID
  //   }
  //   if (dogmaAttribute.tooltipDescriptionID) {
  //     dogmaAttribute.tooltipDescription = dogmaAttribute.tooltipDescriptionID.en
  //     delete dogmaAttribute.tooltipDescriptionID
  //   }
  //   if (dogmaAttribute.tooltipTitleID) {
  //     dogmaAttribute.tooltipTitle = dogmaAttribute.tooltipTitleID.en
  //     delete dogmaAttribute.tooltipTitleID
  //   }
  //   // console.log('dogmaAttributeId', dogmaAttributeId, dogmaAttribute)
  //   // dogmaAttribute.displayName = dogmaAttribute.displayNameID.en
  //   if (!dogmaAttribute.published) {
  //     delete dogmaAttributes[dogmaAttributeId]
  //   }
  // }

  // const dogmaEffects = yamlToJson('./_data/sde/fsd/dogmaEffects.yaml')
  // for (const dogmaEffectId in dogmaEffects) {
  //   const dogmaEffect = dogmaEffects[dogmaEffectId]
  //   // const dogmaAttributeCategory = dogmaAttributeCategories[dogmaAttributeId]
  //   // if (dogmaAttributeCategory) dogmaAttribute.attributeName = dogmaAttributeCategory.name
  //   // console.log('dogmaAttributeId', dogmaAttributeId, dogmaAttribute)
  //   if (!dogmaEffect.published) {
  //     delete dogmaEffects[dogmaEffectId]
  //   }
  // }

  // // Item Names

  // const relevantAttributes = getAllRelevantDogmaAttributes(mutatorAttributes)
  // const itemData = Object.keys(types)
  //   .map((key) => {
  //     const type = types[key]
  //     type.typeID = key
  //     const group = groups[type.groupID]
  //     type.categoryID = group.categoryID
  //     return type
  //   })
  //   .filter((item) => item.published && (item.categoryID === 7 || item.categoryID === 17))// Only get modules, do mutaplasmids count as modules?
  //   .reduce((acc, item) => {
  //     acc[item.typeID] = {
  //       name: item.name.en
  //     }
  //     if (typeDogmas[item.typeID]) {
  //       acc[item.typeID].dogmaAttributes = typeDogmas[item.typeID].dogmaAttributes
  //         .filter(a => relevantAttributes.includes(a.attributeID))
  //         .reduce((obj, item) => {
  //           obj[item.attributeID] = item.value
  //           return obj
  //         }, {})
  //     }

  //     // if (item.typeID === '19325') {
  //     const abyssalType = getAbyssalTypeForSourceTypeId(mutatorAttributes, parseInt(item.typeID))

  //     acc[item.typeID].baseModuleAttributes = {}
  //     if (abyssalType !== null && dynamicAttributes[abyssalType]) {
  //       // console.log('item', item.name.en, abyssalType, dynamicAttributes)
  //       for (const attributeId in dynamicAttributes[abyssalType].baseModuleAttributes) {
  //         const value = typeDogmas[item.typeID].dogmaAttributes.find(a => a.attributeID === parseInt(attributeId)).value
  //         // console.log('attributeId', attributeId, value)
  //         acc[item.typeID].baseModuleAttributes[attributeId] = value
  //       }
  //     }
  //     return acc
  //   }, {})
  // setMutaAttributes(mutatorAttributes, typeDogmas, dogmaAttributes)
  // https://sde.hoboleaks.space/tq/dynamicitemattributes.json
  // https://github.com/stephenswat/eve-abyssal-market/blob/0ef588480f7a4fbe70c4fa1c68a0e8c5d9c99700/abyssal_modules/management/commands/get_abyssal_types.py
  return { abyssalTypes }
}
const copyDogmaAttributeImages = async (abyssalTypes) => {
  // const dogmaAttributes = yamlToJson('./_data/sde/fsd/dogmaAttributes.yaml')
  const iconIDs = yamlToJson('./_data/sde/fsd/iconIDs.yaml')
  const imgPath = path.join('./frontend/_static/icons')
  if (!fs.existsSync(imgPath)) fs.mkdirSync(imgPath)

  const iconIDSet = new Set()
  const iconIDSetUpscale = new Set()
  for (const typeID in abyssalTypes) {
    for (const attribute of abyssalTypes[typeID].attributes) {
      iconIDSet.add(attribute.iconID)
    }
  }
  for (const typeID in abyssalTypes) {
    for (const sourceID in abyssalTypes[typeID].sources) {
      const source = abyssalTypes[typeID].sources[sourceID]
      if (source.metaGroupIconID) {
        iconIDSetUpscale.add(source.metaGroupIconID)
      }
    }
  }

  // console.log('dogmaAttributeImages', dogmaAttributeImages)
  for (const iconID of [...iconIDSet]) {
    const from = iconIDs[iconID].iconFile.toLowerCase().replace('res:/ui/texture/icons/', './_data/Icons/items/')
    const to = `${imgPath}/${iconID}.png`
    // console.log('iconID', iconID, from, to)
    fs.copyFileSync(from, to)
  }

  for (const iconID of [...iconIDSetUpscale]) {
    const from = iconIDs[iconID].iconFile.toLowerCase().replace('res:/ui/texture/icons/', './_data/Icons/items/')
    const to = `${imgPath}/${iconID}.png`
    // console.log('iconID upscale', iconID, from, to)
    // TODO - Find an upscaler that installs and works...
    fs.copyFileSync(from, to)
  }
  console.log('copyDogmaAttributeImages END')
}
const init = async () => {
  await downloadAndUnzip(SDE_URL, './_data', 'sde')
  await downloadAndUnzip(SDE_ICONS_URL, './_data', 'Icons')
  await downloadAndUnzip(SDE_TYPES_URL, './_data', 'Types')
  await downloadJson(DYN_ATTRS_URL, './_data')
  const data = await populateRequiredData()
  await saveRequiredData(data)
  await copyDogmaAttributeImages(data.abyssalTypes)
}
init()
