import { sellersCollection } from './db.js'

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
  await sellersCollection.findOneAndUpdate({ _id: sellerID }, { $set: { discordName: data.discordName } }, { upsert: true, returnOriginal: false })
  return data
}
