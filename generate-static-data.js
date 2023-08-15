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
  const relevantAttributeIDs = []
  for (const attributeName in mutatorAttributes) {
    const attribute = mutatorAttributes[attributeName]
    if (attribute.inputOutputMapping.resultingType === type) {
      const keys = Object.keys(attribute.attributeIDs).map(i => parseInt(i))
      keys.sort((a, b) => a - b)
      return keys
    }
  }

  return relevantAttributeIDs
}
const repairDynamicAttributes = (mutatorAttributes, types) => {
  for (const attributeId in mutatorAttributes) {
    const attribute = mutatorAttributes[attributeId]
    attribute.inputOutputMapping = attribute.inputOutputMapping[0]
  }

  // Are these all muta change attributes that were removed from the game at some point?!

  // // attr 47740 [ 6, 20, 30, 50, 147, 554 ] [ 6, 20, 30, 50, 554 ] false - 147
  // mutatorAttributes[47739].attributeIDs[147] = { max: 2, min: 1 } // Gravid 5MN Microwarpdrive Mutaplasmid
  // mutatorAttributes[47738].attributeIDs[147] = { max: 2, min: 1 } // Unstable 5MN Microwarpdrive Mutaplasmid
  // mutatorAttributes[47737].attributeIDs[147] = { max: 2, min: 1 } // Decayed 5MN Microwarpdrive Mutaplasmid
  // // attr 47408 [ 6, 20, 30, 50, 147, 554 ] [ 6, 20, 30, 50, 554 ] false - 147
  // mutatorAttributes[47741].attributeIDs[147] = { max: 2, min: 1 } // Gravid 50MN Microwarpdrive Mutaplasmid
  // mutatorAttributes[47297].attributeIDs[147] = { max: 2, min: 1 } // Unstable 50MN Microwarpdrive Mutaplasmid
  // mutatorAttributes[47742].attributeIDs[147] = { max: 2, min: 1 } // Decayed 50MN Microwarpdrive Mutaplasmid
  // // attr 47745 [ 6, 20, 30, 50, 147, 554 ] [ 6, 20, 30, 50, 554 ] false - 147
  // mutatorAttributes[47744].attributeIDs[147] = { max: 2, min: 1 } // Gravid 500MN Microwarpdrive Mutaplasmid
  // mutatorAttributes[47743].attributeIDs[147] = { max: 2, min: 1 } // Unstable 500MN Microwarpdrive Mutaplasmid
  // mutatorAttributes[47299].attributeIDs[147] = { max: 2, min: 1 } // Decayed 500MN Microwarpdrive Mutaplasmid
  // // attr 56306 [ 6, 20, 30, 50, 147, 554 ] [ 6, 20, 30, 50, 554 ] false - 147
  // mutatorAttributes[56280].attributeIDs[147] = { max: 2, min: 1 } // Gravid 50000MN Microwarpdrive Mutaplasmid
  // mutatorAttributes[56279].attributeIDs[147] = { max: 2, min: 1 } // Unstable 50000MN Microwarpdrive Mutaplasmid
  // mutatorAttributes[56278].attributeIDs[147] = { max: 2, min: 1 } // Decayed 50000MN Microwarpdrive Mutaplasmid

  // // attr 47824 [ 6, 30, 50, 54, 97, 2044 ] [ 6, 30, 50, 54, 97 ] false - 2044
  // mutatorAttributes[47823].attributeIDs[2044] = { max: 2, min: 1 } // Gravid Small Energy Neutralizer Mutaplasmid
  // mutatorAttributes[47822].attributeIDs[2044] = { max: 2, min: 1 } // Unstable Small Energy Neutralizer Mutaplasmid
  // mutatorAttributes[47821].attributeIDs[2044] = { max: 2, min: 1 } // Decayed Small Energy Neutralizer Mutaplasmid
  // // attr 47828 [ 6, 30, 50, 54, 97, 2044 ] [ 6, 30, 50, 54, 97 ] false - 2044
  // mutatorAttributes[47827].attributeIDs[2044] = { max: 2, min: 1 } // Gravid Medium Energy Neutralizer Mutaplasmid
  // mutatorAttributes[47826].attributeIDs[2044] = { max: 2, min: 1 } // Unstable Medium Energy Neutralizer Mutaplasmid
  // mutatorAttributes[47825].attributeIDs[2044] = { max: 2, min: 1 } // Decayed Medium Energy Neutralizer Mutaplasmid
  // // attr 47832 [ 6, 30, 50, 54, 97, 2044 ] [ 6, 30, 50, 54, 97 ] false - 2044
  // mutatorAttributes[47831].attributeIDs[2044] = { max: 2, min: 1 } // Gravid Heavy Energy Neutralizer Mutaplasmid
  // mutatorAttributes[47830].attributeIDs[2044] = { max: 2, min: 1 } // Unstable Heavy Energy Neutralizer Mutaplasmid
  // mutatorAttributes[47829].attributeIDs[2044] = { max: 2, min: 1 } // Decayed Heavy Energy Neutralizer Mutaplasmid

  // // attr 48419 [ 30, 50, 54, 90, 2044 ] [ 30, 50, 54, 90 ] false - 2044
  // mutatorAttributes[48417].attributeIDs[2044] = { max: 2, min: 1 } // Gravid Small Energy Nosferatu Mutaplasmid
  // mutatorAttributes[48418].attributeIDs[2044] = { max: 2, min: 1 } // Unstable Small Energy Nosferatu Mutaplasmid
  // mutatorAttributes[48416].attributeIDs[2044] = { max: 2, min: 1 } // Decayed Small Energy Nosferatu Mutaplasmid
  // // attr 48423 [ 30, 50, 54, 90, 2044 ] [ 30, 50, 54, 90 ] false - 2044
  // mutatorAttributes[48421].attributeIDs[2044] = { max: 2, min: 1 } // Gravid Medium Energy Nosferatu Mutaplasmid
  // mutatorAttributes[48422].attributeIDs[2044] = { max: 2, min: 1 } // Unstable Medium Energy Nosferatu Mutaplasmid
  // mutatorAttributes[48420].attributeIDs[2044] = { max: 2, min: 1 } // Decayed Medium Energy Nosferatu Mutaplasmid
  // // attr 48427 [ 30, 50, 54, 90, 2044 ] [ 30, 50, 54, 90 ] false - 2044
  // mutatorAttributes[48425].attributeIDs[2044] = { max: 2, min: 1 } // Gravid Heavy Energy Nosferatu Mutaplasmid
  // mutatorAttributes[48426].attributeIDs[2044] = { max: 2, min: 1 } // Unstable Heavy Energy Nosferatu Mutaplasmid
  // mutatorAttributes[48424].attributeIDs[2044] = { max: 2, min: 1 } // Decayed Heavy Energy Nosferatu Mutaplasmid
  // // attr 56311 [ 30, 50, 54, 90, 2044 ] [ 30, 50, 54, 90 ] false - 2044
  // mutatorAttributes[56291].attributeIDs[2044] = { max: 2, min: 1 } // Gravid Capital Energy Nosferatu Mutaplasmid
  // mutatorAttributes[56290].attributeIDs[2044] = { max: 2, min: 1 } // Unstable Capital Energy Nosferatu Mutaplasmid
  // mutatorAttributes[56289].attributeIDs[2044] = { max: 2, min: 1 } // Decayed Capital Energy Nosferatu Mutaplasmid

  // // attr 47732 [ 6, 50, 54, 105 ] [ 6, 50, 54 ] false - 105
  // mutatorAttributes[47731].attributeIDs[105] = { max: 2, min: 1 } // Gravid Warp Scrambler Mutaplasmid
  // mutatorAttributes[47730].attributeIDs[105] = { max: 2, min: 1 } // Unstable Warp Scrambler Mutaplasmid
  // mutatorAttributes[47729].attributeIDs[105] = { max: 2, min: 1 } // Decayed Warp Scrambler Mutaplasmid
  // // attr 56303 [ 6, 50, 54, 105 ] [ 6, 50, 54 ] false - 105
  // mutatorAttributes[56271].attributeIDs[105] = { max: 2, min: 1 } // Gravid Heavy Warp Scrambler Mutaplasmid
  // mutatorAttributes[56270].attributeIDs[105] = { max: 2, min: 1 } // Unstable Heavy Warp Scrambler Mutaplasmid
  // mutatorAttributes[56269].attributeIDs[105] = { max: 2, min: 1 } // Decayed Heavy Warp Scrambler Mutaplasmid

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
}
const populateRequiredData = async () => {
  // Abyssal Types
  const types = yamlToJson('./_data/sde/fsd/typeIDs.yaml')
  const groups = yamlToJson('./_data/sde/fsd/groupIDs.yaml')
  const metaGroups = yamlToJson('./_data/sde/fsd/metaGroups.yaml')

  const mutatorAttributes = JSON.parse(fs.readFileSync('./_data/dynamicitemattributes.json', 'utf8'))
  repairDynamicAttributes(mutatorAttributes, types)

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
  const dogmaAttributes = yamlToJson('./_data/sde/fsd/dogmaAttributes.yaml')
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
  const typeDogmas = yamlToJson('./_data/sde/fsd/typeDogma.yaml')
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
      return acc
    }, {})

  // https://sde.hoboleaks.space/tq/dynamicitemattributes.json
  // https://github.com/stephenswat/eve-abyssal-market/blob/0ef588480f7a4fbe70c4fa1c68a0e8c5d9c99700/abyssal_modules/management/commands/get_abyssal_types.py
  return { abyssalTypes, dogmaAttributes, dogmaEffects, itemData, mutatorAttributes }
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
