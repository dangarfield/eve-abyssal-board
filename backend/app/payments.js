import { inventoryCollection, paymentCollection } from './db'
import { getEvePaymentJournal } from './eve-api'
import { PAYMENT_TYPES, receivePaymentAndPutInventoryOnSale } from './listing-flow'

function groupByAttribute (objects, attribute) {
  const grouped = {}

  objects.forEach(obj => {
    const value = obj[attribute]
    if (value) {
      if (!grouped[value]) {
        grouped[value] = []
      }
      grouped[value].push(obj)
    }
  })

  return grouped
}
export const getSellerPayments = async (characterId) => {
  const payments = await paymentCollection.find({ characterId }).toArray()
  for (const payment of payments) {
    payment.id = payment._id
    delete payment._id
  }
  return payments
}
export const findAndUpdateCompletedPayments = async () => {
  const unpaidPayments = await paymentCollection.find({ paid: false }).toArray()
  const { journal, lastModified } = await getEvePaymentJournal()
  // console.log('journalItemsAll', journal, lastModified)
  const journalItems = journal.filter(j => j.ref_type === 'player_donation')
  // console.log('journalItems', journalItems)
  // const testJournalItem = journalItems.find(j => j.reason === 'abc123')
  // testJournalItem.reason = 'm11ZdStYj7'
  // testJournalItem.amount = 12000000

  console.log('evePaymentTransactions: START')
  for (const unpaidPayment of unpaidPayments) {
    for (const journalItem of journalItems) {
      if (unpaidPayment._id === journalItem.reason) {
        if (journalItem.amount >= unpaidPayment.amount) {
        //   console.log('PAID!', unpaidPayment, journalItem)
          unpaidPayment.paid = true
        }
      }
    }
  }
  const paidPayments = unpaidPayments.filter(p => p.paid)
  if (paidPayments.length > 0) {
    const updateResult = await paymentCollection.updateMany(
      { _id: { $in: paidPayments.map(p => p._id) } },
      { $set: { paid: true } }
    )
    console.log('updateIDs', paidPayments.map(p => p._id), updateResult)
    const toUpdate = groupByAttribute(unpaidPayments.filter(p => p.paid), 'type')
    if (toUpdate.LISTING_FEE) {
      await receivePaymentAndPutInventoryOnSale(toUpdate.LISTING_FEE)
    }
  }

  console.log('findAndUpdateCompletedPayments: END - Updated:', paidPayments.length)
}
export const getPendingPayments = async () => {
  console.log('getPendingPayments')
  const payments = await paymentCollection.find({ paid: false }).toArray()
  return payments
}
export const getCompletePayments = async () => {
  console.log('getCompletePayments')
  const result = await paymentCollection.aggregate([
    { $match: { paid: true } },
    {
      $group: {
        _id: { characterId: '$characterId', characterName: '$characterName', type: '$type' },
        inventoryCount: { $sum: { $size: '$inventory' } },
        totalAmount: { $sum: '$amount' }
      }
    },
    {
      $group: {
        _id: { characterId: '$_id.characterId', characterName: '$_id.characterName' },
        types: {
          $push: {
            type: '$_id.type',
            inventoryCount: '$inventoryCount',
            totalAmount: '$totalAmount'
          }
        }
      }
    }
  ]).toArray()
  console.log('getCompletePayments', result)
  return result
}
export const deletePayment = async (paymentId) => {
  console.log('deletePayment', paymentId)
  const payment = await paymentCollection.findOne({ _id: paymentId, paid: false })
  if (payment.type === PAYMENT_TYPES.LISTING_FEE) {
    const iD = await inventoryCollection.deleteMany({ _id: { $in: payment.inventory } })
    const pD = await paymentCollection.deleteOne({ _id: paymentId })
    console.log('deleted', iD, pD)
  }
  return payment
}
export const amendPayment = async (paymentId, update) => {
  console.log('amendPayment', paymentId, update)
  const payment = await paymentCollection.findOne({ _id: paymentId, paid: false })
  if (update && update.paid) {
    console.log('Update to PAID', payment)
    await paymentCollection.updateOne({ _id: paymentId }, { $set: { paid: true } })
    await receivePaymentAndPutInventoryOnSale([payment])
  }
  return payment
}
