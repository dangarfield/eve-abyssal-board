import { sellersCollection, inventoryCollection } from './db.js'

export const getMailIDForSeller = async (sellerID) => {
  const sellerData = await sellersCollection.findOne({ _id: sellerID })
  if (sellerData.mailRecipient) {
    return sellerData.mailRecipient
  } else {
    return sellerID
  }
}
export const getSellerContactDetails = (sellerIDs) => {
  return [sellerIDs.map(sellerID => { return { sellerID } })]
}
export const getSellerData = async (sellerID) => {
  let sellerData = await sellersCollection.findOne({ _id: sellerID })
  console.log('getSellerData', sellerID, sellerData)
  if (sellerData === null) sellerData = { _id: sellerID }
  sellerData.id = sellerData._id
  delete sellerData._id
  return sellerData
}
export const setSellerData = async (sellerID, data) => {
  console.log('setSellerData', sellerID, data)
  const update = {}
  if (data.discordName) update.discordName = data.discordName
  if (data.mailRecipient) update.mailRecipient = data.mailRecipient
  await sellersCollection.findOneAndUpdate({ _id: sellerID }, { $set: update }, { upsert: true, returnOriginal: false })
  return data
}
export const createStorefront = async (sellerID, sellerName) => {
  const storefront = {
    name: `${sellerName}'s Store`,
    url: sellerName.toLowerCase().replace(/[^a-z-_]/g, ''),
    color: '#4154f1',
    description: 'Welcome to my store! o/\nHave a good look around!',
    blackText: false
  }
  await sellersCollection.findOneAndUpdate({ _id: sellerID }, { $set: { storefront } }, { upsert: true, returnOriginal: false })
}
export const amendStorefront = async (sellerID, storefront) => {
  // TODO - Check that url is not duplicated
  console.log('amendStorefront', sellerID, storefront)
  const existingDocsWithSameUrl = await sellersCollection.findOne({ _id: { $ne: sellerID }, 'storefront.url': storefront.url })
  console.log('existingDocsWithSameUrl', existingDocsWithSameUrl)
  if (existingDocsWithSameUrl !== null) {
    return { info: 'A seller already has this url, try a different one' }
  }
  const result = await sellersCollection.findOneAndUpdate({ _id: sellerID, storefront: { $exists: true } }, { $set: { storefront } }, { returnDocument: true })
  console.log('amendStorefront result', result.value)
  if (result.value === null) {
    return { error: 'Invalid amendment' }
  }
  return storefront
}
export const getStoreData = async (storeID) => {
  const seller = await sellersCollection.findOne({ 'storefront.url': storeID })
  if (seller === null) {
    return { info: '404' }
  }
  const mods = await inventoryCollection.find({ characterId: seller._id, status: 'ON_SALE' }).toArray()
  if (seller.discordName) {
    for (const mod of mods) {
      mod.discordName = seller.discordName
    }
  }
  console.log('getStoreData', storeID, seller.storefront, mods)
  return { storefront: seller.storefront, mods, discordName: seller.discordName }
}
