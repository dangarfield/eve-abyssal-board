import { sellersCollection } from './db'

export const getSellerContactDetails = (sellerIDs) => {
  return [sellerIDs.map(sellerID => { return { sellerID } })]
}
export const getSellerData = async (sellerID, data) => {
  const sellerData = await sellersCollection.findOne({ _id: sellerID })
  return sellerData
}
export const setSellerData = (sellerID, data) => {
  return {}
}
