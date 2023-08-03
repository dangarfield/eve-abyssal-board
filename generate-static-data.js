/* eslint-disable camelcase */
import axios from 'axios'
import AdmZip from 'adm-zip'
import yaml from 'js-yaml'

import fs from 'fs'
import path from 'path'
import { getAllRelevantDogmaAttributes } from './frontend/src/module-types.js'

const SDE_URL = 'https://eve-static-data-export.s3-eu-west-1.amazonaws.com/tranquility/sde.zip'
const SDE_ICONS_URL = 'https://web.ccpgamescdn.com/aws/developers/Uprising_V21.03_Icons.zip'
const SDE_TYPES_URL = 'https://web.ccpgamescdn.com/aws/developers/Uprising_V21.03_Types.zip'

const yamlToJson = (filePath) => {
  return yaml.load(fs.readFileSync(filePath, 'utf-8'))
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
const populateRequiredData = async () => {
  // Abyssal Types
  const types = yamlToJson('./_data/sde/fsd/typeIDs.yaml')
  const groups = yamlToJson('./_data/sde/fsd/groupIDs.yaml')
  const metaGroups = yamlToJson('./_data/sde/fsd/metaGroups.yaml')

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
      const obj = {
        typeID: parseInt(type.typeID),
        name: type.name.en,
        metaGroupID: type.metaGroupID,
        metaGroupName: metaGroup.nameID.en,
        metaGroupIconID: metaGroup.iconID,
        groupName: group.name.en,
        groupIconID: group.iconID
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
  const itemNames = Object.keys(types)
    .map((key) => {
      const type = types[key]
      type.typeID = key
      return type
    })
    .filter((item) => item.published) // Filter items by metaGroupID
    .reduce((acc, item) => {
      acc[item.typeID] = item.name.en
      return acc
    }, {})
  return { abyssalTypes, dogmaAttributes, dogmaEffects, itemNames }
}
const copyDogmaAttributeImages = async () => {
  const dogmaAttributes = yamlToJson('./_data/sde/fsd/dogmaAttributes.yaml')
  const iconIDs = yamlToJson('./_data/sde/fsd/iconIDs.yaml')
  const imgPath = path.join('./frontend/_static/icons')
  if (!fs.existsSync(imgPath)) fs.mkdirSync(imgPath)
  const dogmaAttributeImages = [...new Set(getAllRelevantDogmaAttributes().map(id => dogmaAttributes[id].iconID))].map(iconID => {
    return { iconID, from: iconIDs[iconID].iconFile.replace('res:/ui/texture/icons/', './_data/Icons/items/'), to: `${imgPath}/${iconID}.png` }
  })
  for (const dogmaAttributeImage of dogmaAttributeImages) {
    fs.copyFileSync(dogmaAttributeImage.from, dogmaAttributeImage.to)
  }
  console.log('copyDogmaAttributeImages', dogmaAttributeImages)
}
const init = async () => {
  await downloadAndUnzip(SDE_URL, './_data', 'sde')
  await downloadAndUnzip(SDE_ICONS_URL, './_data', 'Icons')
  await downloadAndUnzip(SDE_TYPES_URL, './_data', 'Types')
  const data = await populateRequiredData()
  await saveRequiredData(data)
  await copyDogmaAttributeImages()
}
init()
