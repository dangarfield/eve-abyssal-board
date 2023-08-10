import { paymentCollection } from './db'

export const getSellerPayments = async (characterId) => {
  const payments = await paymentCollection.find({ characterId }).toArray()
  for (const payment of payments) {
    payment.id = payment._id
    delete payment._id
  }
  return payments
}
