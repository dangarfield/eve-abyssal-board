import API from 'lambda-api'
import { getAppAuth, getAppConfig, setAppConfig } from '../app/config'
import { verifyAdmin, verifyToken } from '../app/auth'
import { getSellerInventory } from '../app/inventory'
import { cancelListing, initiateListingFlow, amendListing } from '../app/listing-flow'
import { ssoAdminLoginStart, ssoAdminReturn } from '../app/sso'
import { findAndUpdateCompletedPayments, getPendingPayments, getCompletePayments, getSellerPayments, deletePayment, amendPayment } from '../app/payments'
import { getEvePaymentJournal } from '../app/eve-api'
import { searchForModulesOfType } from '../app/search'
import { setSellerData, getSellerData } from '../app/sellers'
import { updateInventoryFromPublicContracts } from '../app/contracts'

const app = API()

// Seller Pages
app.get('/api/sellers/:characterId/inventory', verifyToken, async function (req, res) {
  console.log('/api/seller/:characterId/inventory', req.params.characterId, 'auth', req.auth.characterId, req.auth.characterName)
  res.json(await getSellerInventory(parseInt(req.auth.characterId), parseInt(req.params.characterId)))
})
app.get('/api/sellers/@me/payments', verifyToken, async function (req, res) {
  console.log('/api/seller/@me/payments', req.params.characterId, 'auth', req.auth.characterId, req.auth.characterName)
  res.json(await getSellerPayments(parseInt(req.auth.characterId)))
})
app.get('/api/sellers/@me', verifyToken, async function (req, res) {
  console.log('/api/seller/@me', req.params.characterId, 'auth', req.auth.characterId, req.auth.characterName)
  res.json(await getSellerData(parseInt(req.auth.characterId)))
})
app.patch('/api/sellers/@me', verifyToken, async function (req, res) {
  console.log('/api/seller/@me', req.params.characterId, 'auth', req.auth.characterId, req.auth.characterName)
  res.json(await setSellerData(parseInt(req.auth.characterId), req.body))
})

// App Config
app.get('/api/app-config', async (req, res) => {
  return await getAppConfig()
})
app.get('/api/app-config/admin', verifyAdmin, async (req, res) => {
  return await getAppConfig(true)
})
app.post('/api/app-config', verifyAdmin, async (req, res) => {
  return await setAppConfig(req.body)
})
app.get('/api/app-auth', verifyAdmin, async (req, res) => {
  return await getAppAuth()
})

// Listings / Inventory
app.post('/api/listing', verifyToken, async function (req, res) {
  res.json(await initiateListingFlow(req.auth, req.body))
})
app.delete('/api/listing/:itemID', verifyToken, async function (req, res) {
  res.json(await cancelListing(parseInt(req.params.itemID)))
})

app.patch('/api/listing/:itemID', verifyToken, async function (req, res) {
  res.json(await amendListing(parseInt(req.params.itemID), req.body))
})
app.post('/api/search/:typeID', async function (req, res) {
  res.json(await searchForModulesOfType(parseInt(req.params.typeID), req.body))
})

// Sellers
app.get('/api/sellers/:sellerID', async function (req, res) {
  res.json(await getSellerData(parseInt(req.params.sellerID)))
})
app.post('/api/sellers/:sellerID', async function (req, res) {
  res.json(await setSellerData(parseInt(req.params.sellerID), req.body))
})

// Payments
app.get('/api/payments/pending', verifyAdmin, async (req, res) => {
  res.json(await getPendingPayments())
})
app.get('/api/payments/complete', verifyAdmin, async (req, res) => {
  res.json(await getCompletePayments())
})
app.patch('/api/payments/:paymentId', verifyAdmin, async (req, res) => {
  res.json(await amendPayment(req.params.paymentId, req.body))
})
app.delete('/api/payments/:paymentId', verifyAdmin, async (req, res) => {
  res.json(await deletePayment(req.params.paymentId))
})
app.get('/api/journal', verifyAdmin, async (req, res) => {
  res.json(await getEvePaymentJournal())
})

// Admin
app.get('/api/sso/login', verifyAdmin, async function (req, res) {
  const loginUrl = await ssoAdminLoginStart()
  res.json({ loginUrl })
})
app.get('/api/sso/return', async function (req, res) {
  await ssoAdminReturn(req.query.code, req.query.state)
  res.redirect('/admin')
})
app.any('/api/admin-task', verifyAdmin, async function (req, res) {
  console.log('/api/admin-task', 'SUCCESS')
  await findAndUpdateCompletedPayments()
  await updateInventoryFromPublicContracts() // Moved to background task
  res.json({})
})

export async function handler (event, context) {
  return await app.run(event, context)
}
