import { inventoryCollection, paymentCollection } from '../app/db.js'
import { getAppAuth, getAppConfig } from './config.js'
import { nanoid } from 'nanoid'
import { sendMail } from './eve-api.js'
import { createStorefront, getMailIDForSeller } from './sellers.js'

export const INVENTORY_STATUS = { AWAITING_PAYMENT: 'AWAITING_PAYMENT', ON_SALE: 'ON_SALE', CANCELLED: 'CANCELLED', COMPLETE: 'COMPLETE' }
// CONST APPRAISAL_STATUS = {AWAITING_APPRAISAL: 'AWAITING_APPRAISAL', COMPLETE:'COMPLETE'}
export const PAYMENT_TYPES = { LISTING_FEE: 'LISTING_FEE', PRICE_CHANGE_FEE: 'PRICE_CHANGE_FEE', STOREFRONT_FEE: 'STOREFRONT_FEE', PREMIUM_FEE: 'PREMIUM_FEE' }

export const initiateListingFlow = async (auth, inventoryItems) => {
  for (const inventoryItem of inventoryItems) {
    inventoryItem._id = inventoryItem.itemID
    inventoryItem.status = INVENTORY_STATUS.AWAITING_PAYMENT
    inventoryItem.characterId = auth.characterId
    inventoryItem.characterName = auth.characterName
    // TODO - Validate this data and override it
  }
  console.log('initiateListingFlow', auth, inventoryItems)

  // Add items to inventory collection
  try {
    await inventoryCollection.deleteMany({ _id: { $in: inventoryItems.map(i => i.itemID) } })
    await inventoryCollection.insertMany(inventoryItems)
    // TODO - Change this to an upsert and amend, because they might be public contracts
  } catch (error) {
    console.error('initiateListingFlow ADD INVENTORY ITEMS ERROR', error)
  }

  // Create and a payment awaiting item linking inventory items with payment request

  const appConfig = await getAppConfig(true)
  const appAuth = await getAppAuth()

  const totalListingPrice = inventoryItems.map(i => i.listingPrice).reduce((sum, v) => {
    let listingPrice = v
    if (listingPrice < appConfig.listingFeeThreshold) {
      listingPrice = 0
    } else {
      listingPrice = appConfig.listingPercentage * listingPrice
    }
    if (listingPrice >= appConfig.listingFeeCap) {
      listingPrice = appConfig.listingFeeCap
    }
    return sum + listingPrice
  }, 0)
  const paymentItem = {
    _id: nanoid(10),
    characterId: auth.characterId,
    characterName: auth.characterName,
    amount: appConfig.listingPercentage * totalListingPrice,
    inventory: inventoryItems.map(i => i._id),
    type: PAYMENT_TYPES.LISTING_FEE,
    creationDate: new Date(),
    paid: totalListingPrice === 0
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
<b>Amount</b>: ${paymentItem.amount}<br>
<b>Reason</b>: ${paymentItem._id}<br><br><br>
Please be careful to fill this information in carefully.<br>
It may take up to 1 hour for the transation to be registered and your items listed.<br><br>
For any specific questions, contact us on </font><font size="14" color="#ffffe400"><loc><a href="${appConfig.discordUrl}" target="_blank">discord</a></loc></font><font size="14" color="#bfffffff">.<br><br>
Thanks</font>`.replace(/\n/g, '')

  if (totalListingPrice === 0) {
    await receivePaymentAndPutInventoryOnSale([paymentItem]) // Put on sale immediately // async
  } else {
    const mailCharacterID = await getMailIDForSeller(auth.characterId)
    await sendMail(mailCharacterID, 'Abyss Board Listing Fee', body)
  }

  return {
    corpName: appAuth.corpName,
    account: appConfig.corpDivisionName,
    amount: paymentItem.amount,
    reason: paymentItem._id
  }
}

export const initiateAmendListingPriceFlow = async (auth, inventory, newListingPrice) => {
  const appConfig = await getAppConfig(true)
  const appAuth = await getAppAuth()
  let listingFee = newListingPrice
  if (listingFee < appConfig.listingFeeThreshold) {
    listingFee = 0
  } else {
    listingFee = appConfig.listingPercentage * listingFee
  }
  if (listingFee >= appConfig.listingFeeCap) {
    listingFee = appConfig.listingFeeCap
  }
  const paymentItem = {
    _id: nanoid(10),
    characterId: auth.characterId,
    characterName: auth.characterName,
    amount: listingFee,
    inventory: [inventory._id],
    type: PAYMENT_TYPES.PRICE_CHANGE_FEE,
    creationDate: new Date(),
    paid: listingFee === 0,
    newListingPrice
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
You have amended the price of an item<br>
Price change payment is ${paymentItem.amount.toLocaleString()} ISK.<br>
Right click on this </font><font size="14" color="#ffd98d00"><a href="showinfo:2//${appAuth.corpId}">${appAuth.corpName}</a></font><font size="14" color="#bfffffff"> and click 'Give Money'.<br><br>
Fill in the details as follows:<br><br>
<b>Amount</b>: ${paymentItem.amount}<br>
<b>Reason</b>: ${paymentItem._id}<br><br><br>
Please be careful to fill this information in carefully.<br>
It may take up to 1 hour for the transation to be registered and your items listed.<br><br>
For any specific questions, contact us on </font><font size="14" color="#ffffe400"><loc><a href="${appConfig.discordUrl}" target="_blank">discord</a></loc></font><font size="14" color="#bfffffff">.<br><br>
Thanks</font>`.replace(/\n/g, '')

  if (listingFee === 0) {
    await receivePaymentAndAmendInventoryListingPrice([paymentItem]) // Put on sale immediately // async
  } else {
    const mailCharacterID = await getMailIDForSeller(auth.characterId)
    await sendMail(mailCharacterID, 'Abyss Board Price Change Fee', body)
  }

  return {
    corpName: appAuth.corpName,
    account: appConfig.corpDivisionName,
    amount: paymentItem.amount,
    reason: paymentItem._id,
    listingPrice: paymentItem.newListingPrice
  }
}
export const initiateStorefrontCreationFlow = async (auth) => {
  const appConfig = await getAppConfig(true)
  const appAuth = await getAppAuth()
  const paymentItem = {
    _id: nanoid(10),
    characterId: auth.characterId,
    characterName: auth.characterName,
    amount: appConfig.storefrontFee,
    inventory: [],
    type: PAYMENT_TYPES.STOREFRONT_FEE,
    creationDate: new Date(),
    paid: false
  }

  try {
    await paymentCollection.insertOne(paymentItem)
  } catch (error) {
    console.error('initiateListingFlow ADD PAYMENT ITEM ERROR', error)
  }
  // Mail payment request
  const body = `
<font size="14" color="#bfffffff">
Thanks for choosing Abyss Board.<br><br>
You have chosen to create a personalised storefront<br>
Personalised storefront fee is ${paymentItem.amount.toLocaleString()} ISK.<br>
Right click on this </font><font size="14" color="#ffd98d00"><a href="showinfo:2//${appAuth.corpId}">${appAuth.corpName}</a></font><font size="14" color="#bfffffff"> and click 'Give Money'.<br><br>
Fill in the details as follows:<br><br>
<b>Amount</b>: ${paymentItem.amount}<br>
<b>Reason</b>: ${paymentItem._id}<br><br><br>
Please be careful to fill this information in carefully.<br>
It may take up to 1 hour for the transation to be registered and your storefront created.<br><br>
For any specific questions, contact us on </font><font size="14" color="#ffffe400"><loc><a href="${appConfig.discordUrl}" target="_blank">discord</a></loc></font><font size="14" color="#bfffffff">.<br><br>
Thanks</font>`.replace(/\n/g, '')
  const mailCharacterID = await getMailIDForSeller(auth.characterId)
  await sendMail(mailCharacterID, 'Abyss Board Storefront Fee', body)

  return {
    corpName: appAuth.corpName,
    account: appConfig.corpDivisionName,
    amount: paymentItem.amount,
    reason: paymentItem._id
  }
}

export const initiatePremiumModFlow = async (auth, itemID) => {
  const appConfig = await getAppConfig(true)
  const appAuth = await getAppAuth()
  const paymentItem = {
    _id: nanoid(10),
    characterId: auth.characterId,
    characterName: auth.characterName,
    amount: appConfig.premiumListing,
    inventory: [itemID],
    type: PAYMENT_TYPES.PREMIUM_FEE,
    creationDate: new Date(),
    paid: false
  }

  try {
    await paymentCollection.insertOne(paymentItem)
  } catch (error) {
    console.error('initiateListingFlow ADD PAYMENT ITEM ERROR', error)
  }
  // Mail payment request
  const body = `
<font size="14" color="#bfffffff">
Thanks for choosing Abyss Board.<br><br>
You have chosen to create a premium mod<br>
Premium mod fee is ${paymentItem.amount.toLocaleString()} ISK.<br>
Right click on this </font><font size="14" color="#ffd98d00"><a href="showinfo:2//${appAuth.corpId}">${appAuth.corpName}</a></font><font size="14" color="#bfffffff"> and click 'Give Money'.<br><br>
Fill in the details as follows:<br><br>
<b>Amount</b>: ${paymentItem.amount}<br>
<b>Reason</b>: ${paymentItem._id}<br><br><br>
Please be careful to fill this information in carefully.<br>
It may take up to 1 hour for the transation to be registered and your premium mod.<br><br>
For any specific questions, contact us on </font><font size="14" color="#ffffe400"><loc><a href="${appConfig.discordUrl}" target="_blank">discord</a></loc></font><font size="14" color="#bfffffff">.<br><br>
Thanks</font>`.replace(/\n/g, '')
  const mailCharacterID = await getMailIDForSeller(auth.characterId)
  await sendMail(mailCharacterID, 'Abyss Board Premium Listing Fee', body)

  return {
    corpName: appAuth.corpName,
    account: appConfig.corpDivisionName,
    amount: paymentItem.amount,
    reason: paymentItem._id
  }
}

export const receivePaymentAndPutInventoryOnSale = async (paymentsMade) => {
  // console.log('receivePaymentAndPutInventoryOnSale a', paymentsMade)
  const uniqueInventoryValues = new Set()
  paymentsMade.forEach(item => {
    item.inventory.forEach(value => {
      uniqueInventoryValues.add(value)
    })
  })
  const uniqueInventoryArray = Array.from(uniqueInventoryValues)

  // console.log('receivePaymentAndPutInventoryOnSale b', paymentsMade, uniqueInventoryArray)

  await inventoryCollection.updateMany(
    { _id: { $in: uniqueInventoryArray } },
    { $set: { status: INVENTORY_STATUS.ON_SALE } }
  )
  // console.log('updateIDs', uniqueInventoryArray, updateResult)

  const appConfig = await getAppConfig()
  for (const paymentMade of paymentsMade) {
    const body = `
<font size="14" color="#bfffffff">
Your ${paymentMade.inventory.length} mod${paymentMade.inventory.length > 1 ? 's have' : ' has'} now been listed for sale!<br>
For any specific questions, contact us on </font><font size="14" color="#ffffe400"><loc><a href="${appConfig.discordUrl}">discord</a></loc></font><font size="14" color="#bfffffff">.<br><br>
Thanks</font>`.replace(/\n/g, '')
    const mailCharacterID = await getMailIDForSeller(paymentMade.characterId)
    console.log('sendMail Abyss Board Listing Now Live', paymentMade.characterId, '->', mailCharacterID)
    await sendMail(mailCharacterID, 'Abyss Board Listing Now Live', body)
  }
}
export const receivePaymentAndAmendInventoryListingPrice = async (paymentsMade) => {
  const appConfig = await getAppConfig()
  for (const paymentMade of paymentsMade) {
    console.log('receivePaymentAndAmendInventoryListingPrice', 'paymentMade', paymentMade)

    await inventoryCollection.updateMany(
      { _id: { $in: paymentMade.inventory } },
      { $set: { listingPrice: paymentMade.newListingPrice } }
    )
    const body = `
<font size="14" color="#bfffffff">
Your mod listing price has now been changed!<br>
For any specific questions, contact us on </font><font size="14" color="#ffffe400"><loc><a href="${appConfig.discordUrl}">discord</a></loc></font><font size="14" color="#bfffffff">.<br><br>
Thanks</font>`.replace(/\n/g, '')
    const mailCharacterID = await getMailIDForSeller(paymentMade.characterId)
    await sendMail(mailCharacterID, 'Abyss Board Price Change Now Live', body)
  }
}
export const receivePaymentAndCreateStorefront = async (paymentsMade) => {
  const appConfig = await getAppConfig()
  for (const paymentMade of paymentsMade) {
    console.log('receivePaymentAndCreateStorefront', 'paymentMade', paymentMade)

    await createStorefront(paymentMade.characterId, paymentMade.characterName)

    const body = `
<font size="14" color="#bfffffff">
Thanks for paying your storefront fee on Abyss Board.<br><br>
Your storefront will now be available!<br>
For any specific questions, contact us on </font><font size="14" color="#ffffe400"><loc><a href="${appConfig.discordUrl}">discord</a></loc></font><font size="14" color="#bfffffff">.<br><br>
Thanks</font>`.replace(/\n/g, '')
    const mailCharacterID = await getMailIDForSeller(paymentMade.characterId)
    await sendMail(mailCharacterID, 'Abyss Board Storefront Payment Received', body)
  }
}
export const receivePaymentAndMakeModPremium = async (paymentsMade) => {
  const appConfig = await getAppConfig()
  for (const paymentMade of paymentsMade) {
    console.log('receivePaymentAndMakeModPremium', 'paymentMade', paymentMade)

    await inventoryCollection.updateMany(
      { _id: { $in: paymentMade.inventory } },
      { $set: { premium: true } }
    )

    const body = `
<font size="14" color="#bfffffff">
Thanks for paying your premium listing fee on Abyss Board.<br><br>
Your premium listing mod is now live!<br>
For any specific questions, contact us on </font><font size="14" color="#ffffe400"><loc><a href="${appConfig.discordUrl}">discord</a></loc></font><font size="14" color="#bfffffff">.<br><br>
Thanks</font>`.replace(/\n/g, '')
    const mailCharacterID = await getMailIDForSeller(paymentMade.characterId)
    await sendMail(mailCharacterID, 'Abyss Board Premium Listing Payment Received', body)
  }
}
export const cancelListing = async (itemID) => {
  const payment = await paymentCollection.findOne({ inventory: itemID, type: PAYMENT_TYPES.LISTING_FEE, paid: false })
  console.log('cancelListing', itemID, payment)
  if (payment) {
    if (payment.inventory.length > 1) {
      payment.inventory = payment.inventory.filter(i => i !== itemID)
      const config = await getAppConfig()
      payment.amount = (config.listingPrice * payment.inventory.length)
      const updateRes = await paymentCollection.updateOne({ _id: payment._id }, { $set: { inventory: payment.inventory, amount: payment.amount } })

      console.log('updateRes', updateRes)
    } else {
      await paymentCollection.deleteOne({ _id: payment._id })
    }
  }

  const item = await inventoryCollection.deleteOne({ _id: itemID })

  console.log('cancelListing', itemID, item, payment)
  return { itemID, status: INVENTORY_STATUS.CANCELLED }
}
export const amendListing = async (auth, itemID, amend) => {
  if (amend && amend.status && INVENTORY_STATUS[amend.status]) {
    console.log('Good to amend status', amend)
    await inventoryCollection.updateOne({ _id: itemID }, { $set: { status: amend.status } })
  } else if (amend && amend.listingPrice) {
    const inventory = await inventoryCollection.findOne({ _id: itemID })
    console.log('amendListing inventory', inventory, amend.listingPrice, inventory.listingPrice, amend.listingPrice <= inventory.listingPrice)
    if (amend.listingPrice <= inventory.listingPrice) {
      await inventoryCollection.updateOne({ _id: itemID }, { $set: { listingPrice: amend.listingPrice } })
    } else {
      console.log('amend listing flow')
      const paymentDetails = await initiateAmendListingPriceFlow(auth, inventory, amend.listingPrice)
      return { itemID, amend, paymentDetails }
    }
  } else if (amend && amend.premium) {
    console.log('premium listing flow')
    const paymentDetails = await initiatePremiumModFlow(auth, itemID)
    return { itemID, paymentDetails }
  }
  // const item = await inventoryCollection.deleteOne({ _id: itemID })
  console.log('amendListing', itemID, amend)
  return { itemID, amend }
}
