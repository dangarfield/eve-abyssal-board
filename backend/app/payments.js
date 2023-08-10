import { paymentCollection } from './db'
import { getEvePaymentJournal } from './eve-api'
import { receivePaymentAndPutInventoryOnSale } from './listing-flow'

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
  const journalItems = (await getEvePaymentJournal()).filter(j => j.ref_type === 'player_donation')

  const testJournalItem = journalItems.find(j => j.reason === 'abc123')
  testJournalItem.reason = 'm11ZdStYj7'
  testJournalItem.amount = 12000000

  console.log('evePaymentTransactions: START', unpaidPayments, journalItems)
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

  console.log('findAndUpdateCompletedPayments: END')
}
