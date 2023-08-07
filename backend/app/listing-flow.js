import { inventoryCollection, paymentCollection } from '../app/db.js'
import { ObjectId } from 'mongodb'
import { getAppAuth, getAppConfig } from './config.js'
import { nanoid } from 'nanoid'
import { sendMail } from './eve-api.js'

const INVENTORY_STATUS = { AWAITING_PAYMENT: 'AWAITING_PAYMENT', ON_SALE: 'ON_SALE', NO_LONGER_AVAILABLE: 'NO_LONGER_AVAILABLE', COMPLETE: 'COMPLETE', CONTRACT: 'CONTRACT' }
// CONST APPRAISAL_STATUS = {AWAITING_APPRAISAL: 'AWAITING_APPRAISAL', COMPLETE:'COMPLETE'}

export const initiateListingFlow = async (auth, inventoryItems) => {
  for (const inventoryItem of inventoryItems) {
    inventoryItem._id = inventoryItem.itemId
    inventoryItem.status = INVENTORY_STATUS.AWAITING_PAYMENT
    inventoryItem.characterId = auth.characterId
    inventoryItem.characterName = auth.characterName
    // TODO - Validate this data and override it
  }
  console.log('initiateListingFlow', auth, inventoryItems)

  // Add items to inventory collection
  try {
    await inventoryCollection.insertMany(inventoryItems)
  } catch (error) {
    console.error('initiateListingFlow ADD INVENTORY ITEMS ERROR', error)
  }

  // Create and a payment awaiting item linking inventory items with payment request

  const appConfig = await getAppConfig(true)
  const appAuth = await getAppAuth()
  const paymentItem = {
    _id: new ObjectId().toString(),
    characterId: auth.characterId,
    characterName: auth.characterName,
    amount: appConfig.listingPrice * inventoryItems.length,
    inventory: inventoryItems.map(i => i._id),
    ref: nanoid(10)
  }
  console.log('paymentItem', paymentItem)
  try {
    await paymentCollection.insertOne(paymentItem)
  } catch (error) {
    console.error('initiateListingFlow ADD PAYMENT ITEM ERROR', error)
  }

  // Mail payment request
  const body = `
<font size="14" color="#bfffffff">
Thanks for choosing Abyss Board.<br><br>
You have listed ${inventoryItems.length} item${inventoryItems.length > 1 ? 's' : ''}.<br>
Listing payment is ${paymentItem.amount.toLocaleString()} ISK.<br>
Right click on this </font><font size="14" color="#ffd98d00"><a href="showinfo:2//${appAuth.corpId}">${appAuth.corpName}</a></font><font size="14" color="#bfffffff"> and click 'Give Money'.<br><br>
Fill in the details as follows:<br><br>
<b>Account</b>: ${appConfig.corpDivisionName}<br>
<b>Amount</b>: ${paymentItem.amount}<br>
<b>Reason</b>: ${paymentItem.ref}<br><br><br>
Please be careful to fill this information in carefully.<br>
It may take up to 1 hour for the transation to be registered and your items listed.<br><br>
For any specific questions, contact us on </font><font size="14" color="#ffffe400"><loc><a href="${appConfig.discordUrl}">discord</a></loc></font><font size="14" color="#bfffffff">.<br><br>
Thanks</font>`.replace(/\n/g, '')
  await sendMail(auth.characterId, 'Abyss Board Listing Fee', body)

  for (const inventoryItem of inventoryItems) {
    delete inventoryItem._id
  }
  return { inventoryItems }
}
