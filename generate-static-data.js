/* eslint-disable camelcase */
import axios from 'axios'
import AdmZip from 'adm-zip'
import yaml from 'js-yaml'

import fs from 'fs'
import path from 'path'

const SDE_URL = 'https://eve-static-data-export.s3-eu-west-1.amazonaws.com/tranquility/sde.zip'
const SDE_ICONS_URL = 'https://web.ccpgamescdn.com/aws/developers/Uprising_V21.03_Icons.zip'
const SDE_TYPES_URL = 'https://web.ccpgamescdn.com/aws/developers/Uprising_V21.03_Types.zip'
const DYN_ATTRS_URL = 'https://sde.hoboleaks.space/tq/dynamicitemattributes.json'

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
      const keys = Object.keys(attribute.attributeIDs).map(i => parseInt(i))
      keys.sort((a, b) => a - b)
      return keys
    }
  }
  return null
}
const getAbyssalTypeForSourceTypeId = (mutatorAttributes, type) => {
  for (const attributeName in mutatorAttributes) {
    const attribute = mutatorAttributes[attributeName]
    if (attribute.inputOutputMapping.applicableTypes.includes(type)) {
      return attribute.inputOutputMapping.resultingType
    }
  }
  return null
}
const setBaseModelAttribute = (mutatorAttributes, typeDogmas, dogmaAttributes, dynamicAttributes, abyssalItemId, attributeId) => {
  for (const attributeName in mutatorAttributes) {
    const attribute = mutatorAttributes[attributeName]
    if (attribute.inputOutputMapping.resultingType === abyssalItemId) {
      const applicableTypeValues = attribute.inputOutputMapping.applicableTypes.map(t => typeDogmas[t].dogmaAttributes.find(a => a.attributeID === attributeId).value)
      const highIsGood = dogmaAttributes[attributeId].highIsGood
      const min = highIsGood ? Math.min(...applicableTypeValues) : Math.max(...applicableTypeValues)
      const max = highIsGood ? Math.max(...applicableTypeValues) : Math.min(...applicableTypeValues)
      // console.log('setBaseModelAttribute', attributeId, applicableTypeValues, min, max, highIsGood)
      if (dynamicAttributes[abyssalItemId] === undefined) dynamicAttributes[abyssalItemId] = {}
      if (dynamicAttributes[abyssalItemId].baseModuleAttributes === undefined) dynamicAttributes[abyssalItemId].baseModuleAttributes = {}
      dynamicAttributes[abyssalItemId].baseModuleAttributes[attributeId] = { min, max, highIsGood }
      return { min, max, highIsGood }
    }
  }
  return null
}
const getDynamicAttributes = (mutatorAttributes, typeDogmas, dogmaAttributes, types) => {
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
  // mutatorAttributes[47701].attributeIDs[30] = { max: 2, min: 1 } // Gravid Stasis Webifier Mutaplasmid
  // mutatorAttributes[47700].attributeIDs[30] = { max: 2, min: 1 } // Unstable Stasis Webifier Mutaplasmid
  // mutatorAttributes[47699].attributeIDs[30] = { max: 2, min: 1 } // Decayed Stasis Webifier Mutaplasmid

  // // attr 56312 [ 6, 30, 50, 54, 97, 2044 ] [ 6, 30, 50, 54, 97 ] false - 2044
  // mutatorAttributes[56294].attributeIDs[2044] = { max: 2, min: 1 } // Gravid Capital Energy Neutralizer Mutaplasmid
  // mutatorAttributes[56293].attributeIDs[2044] = { max: 2, min: 1 } // Unstable Capital Energy Neutralizer Mutaplasmid
  // mutatorAttributes[56292].attributeIDs[2044] = { max: 2, min: 1 } // Decayed Capital Energy Neutralizer Mutaplasmid

  // for (const attributeId in mutatorAttributes) {
  //   const attribute = mutatorAttributes[attributeId]
  //   if (attribute.inputOutputMapping.resultingType === 47702) {
  //     console.log('47702', attributeId, types[attributeId].name.en, attribute)
  //   }
  // }
  return dynamicAttributes
}
const populateRequiredData = async () => {
  // Abyssal Types
  const types = yamlToJson('./_data/sde/fsd/typeIDs.yaml')
  const groups = yamlToJson('./_data/sde/fsd/groupIDs.yaml')
  const metaGroups = yamlToJson('./_data/sde/fsd/metaGroups.yaml')

  const typeDogmas = yamlToJson('./_data/sde/fsd/typeDogma.yaml')
  const dogmaAttributes = yamlToJson('./_data/sde/fsd/dogmaAttributes.yaml')
  const mutatorAttributes = JSON.parse(fs.readFileSync('./_data/dynamicitemattributes.json', 'utf8'))
  const dynamicAttributes = getDynamicAttributes(mutatorAttributes, typeDogmas, dogmaAttributes, types)
  // console.log('dynamicAttributes', dynamicAttributes)
  const abyssalTypes = Object.keys(types)
    .map((key) => {
      const type = types[key]
      type.typeID = key
      return type
    })
    .filter((item) => item.published && item.metaGroupID && item.metaGroupID === 15) // Filter items by metaGroupID
    .map((type) => {
      const group = groups[type.groupID]
      const metaGroup = metaGroups[type.metaGroupID]
      const attributes = getRelevantDogmaAttributesForTypeId(mutatorAttributes, parseInt(type.typeID))
      const obj = {
        typeID: parseInt(type.typeID),
        name: type.name.en,
        metaGroupID: type.metaGroupID,
        metaGroupName: metaGroup.nameID.en,
        metaGroupIconID: metaGroup.iconID,
        groupName: group.name.en,
        groupIconID: group.iconID,
        attributes
      }
      return obj
    }).reduce((acc, item) => {
      acc[item.typeID] = item
      return acc
    }, {})

  // Dogma Attributes

  const dogmaAttributeCategories = yamlToJson('./_data/sde/fsd/dogmaAttributeCategories.yaml')

  for (const dogmaAttributeId in dogmaAttributes) {
    const dogmaAttribute = dogmaAttributes[dogmaAttributeId]
    const dogmaAttributeCategory = dogmaAttributeCategories[dogmaAttribute.categoryID]
    if (dogmaAttributeCategory) dogmaAttribute.categoryName = dogmaAttributeCategory.name
    if (dogmaAttribute.displayNameID) {
      dogmaAttribute.displayName = dogmaAttribute.displayNameID.en
      delete dogmaAttribute.displayNameID
    }
    if (dogmaAttribute.displayNameID) {
      dogmaAttribute.displayName = dogmaAttribute.displayNameID.en
      delete dogmaAttribute.displayNameID
    }
    if (dogmaAttribute.tooltipDescriptionID) {
      dogmaAttribute.tooltipDescription = dogmaAttribute.tooltipDescriptionID.en
      delete dogmaAttribute.tooltipDescriptionID
    }
    if (dogmaAttribute.tooltipTitleID) {
      dogmaAttribute.tooltipTitle = dogmaAttribute.tooltipTitleID.en
      delete dogmaAttribute.tooltipTitleID
    }
    // console.log('dogmaAttributeId', dogmaAttributeId, dogmaAttribute)
    // dogmaAttribute.displayName = dogmaAttribute.displayNameID.en
    if (!dogmaAttribute.published) {
      delete dogmaAttributes[dogmaAttributeId]
    }
  }

  const dogmaEffects = yamlToJson('./_data/sde/fsd/dogmaEffects.yaml')
  for (const dogmaEffectId in dogmaEffects) {
    const dogmaEffect = dogmaEffects[dogmaEffectId]
    // const dogmaAttributeCategory = dogmaAttributeCategories[dogmaAttributeId]
    // if (dogmaAttributeCategory) dogmaAttribute.attributeName = dogmaAttributeCategory.name
    // console.log('dogmaAttributeId', dogmaAttributeId, dogmaAttribute)
    if (!dogmaEffect.published) {
      delete dogmaEffects[dogmaEffectId]
    }
  }

  // Item Names

  const relevantAttributes = getAllRelevantDogmaAttributes(mutatorAttributes)
  const itemData = Object.keys(types)
    .map((key) => {
      const type = types[key]
      type.typeID = key
      const group = groups[type.groupID]
      type.categoryID = group.categoryID
      return type
    })
    .filter((item) => item.published && (item.categoryID === 7 || item.categoryID === 17))// Only get modules, do mutaplasmids count as modules?
    .reduce((acc, item) => {
      acc[item.typeID] = {
        name: item.name.en
      }
      if (typeDogmas[item.typeID]) {
        acc[item.typeID].dogmaAttributes = typeDogmas[item.typeID].dogmaAttributes
          .filter(a => relevantAttributes.includes(a.attributeID))
          .reduce((obj, item) => {
            obj[item.attributeID] = item.value
            return obj
          }, {})
      }

      // if (item.typeID === '19325') {
      const abyssalType = getAbyssalTypeForSourceTypeId(mutatorAttributes, parseInt(item.typeID))

      acc[item.typeID].baseModuleAttributes = {}
      if (abyssalType !== null && dynamicAttributes[abyssalType]) {
        // console.log('item', item.name.en, abyssalType, dynamicAttributes)
        for (const attributeId in dynamicAttributes[abyssalType].baseModuleAttributes) {
          const value = typeDogmas[item.typeID].dogmaAttributes.find(a => a.attributeID === parseInt(attributeId)).value
          // console.log('attributeId', attributeId, value)
          acc[item.typeID].baseModuleAttributes[attributeId] = value
        }
      }
      return acc
    }, {})

  // https://sde.hoboleaks.space/tq/dynamicitemattributes.json
  // https://github.com/stephenswat/eve-abyssal-market/blob/0ef588480f7a4fbe70c4fa1c68a0e8c5d9c99700/abyssal_modules/management/commands/get_abyssal_types.py
  return { abyssalTypes, dogmaAttributes, dogmaEffects, itemData, mutatorAttributes, dynamicAttributes }
}
const copyDogmaAttributeImages = async (mutatorAttributes) => {
  const dogmaAttributes = yamlToJson('./_data/sde/fsd/dogmaAttributes.yaml')
  const iconIDs = yamlToJson('./_data/sde/fsd/iconIDs.yaml')
  const imgPath = path.join('./frontend/_static/icons')
  if (!fs.existsSync(imgPath)) fs.mkdirSync(imgPath)
  const dogmaAttributeImages = [...new Set(getAllRelevantDogmaAttributes(mutatorAttributes).map(id => dogmaAttributes[id].iconID))].map(iconID => {
    return { iconID, from: iconIDs[iconID].iconFile.replace('res:/ui/texture/icons/', './_data/Icons/items/'), to: `${imgPath}/${iconID}.png` }
  })
  for (const dogmaAttributeImage of dogmaAttributeImages) {
    fs.copyFileSync(dogmaAttributeImage.from, dogmaAttributeImage.to)
  }
//   console.log('copyDogmaAttributeImages', dogmaAttributeImages)
}
const init = async () => {
  await downloadAndUnzip(SDE_URL, './_data', 'sde')
  await downloadAndUnzip(SDE_ICONS_URL, './_data', 'Icons')
  await downloadAndUnzip(SDE_TYPES_URL, './_data', 'Types')
  await downloadJson(DYN_ATTRS_URL, './_data')
  const data = await populateRequiredData()
  await saveRequiredData(data)
  await copyDogmaAttributeImages(data.mutatorAttributes)
}
init()
