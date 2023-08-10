import API from 'lambda-api'
import { getAppAuth, getAppConfig, setAppConfig } from '../app/config'
import { verifyAdmin, verifyToken } from '../app/auth'
import { getSellerInventory } from '../app/inventory'
import { initiateListingFlow } from '../app/listing-flow'
import { ssoAdminLoginStart, ssoAdminReturn } from '../app/sso'
import { findAndUpdateCompletedPayments, getSellerPayments } from '../app/payments'

const app = API()

app.get('/api/seller/:characterId/inventory', verifyToken, async function (req, res) {
  console.log('/api/seller/:characterId/inventory', req.params.characterId, 'auth', req.auth.characterId, req.auth.characterName)
  res.json(await getSellerInventory(parseInt(req.auth.characterId), parseInt(req.params.characterId)))
})
app.get('/api/seller/@me/payments', verifyToken, async function (req, res) {
  console.log('/api/seller/@me/payments', req.params.characterId, 'auth', req.auth.characterId, req.auth.characterName)
  res.json(await getSellerPayments(parseInt(req.auth.characterId)))
})

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

app.post('/api/listing', verifyToken, async function (req, res) {
  res.json((await initiateListingFlow(req.auth, req.body)))
})

app.get('/api/sso/login', verifyAdmin, async function (req, res) {
  const loginUrl = await ssoAdminLoginStart()
  res.json({ loginUrl })
})
app.get('/api/sso/return', async function (req, res) {
  await ssoAdminReturn(req.query.code, req.query.state)
  res.redirect('/#/admin')
})
app.get('/api/admin-task', verifyAdmin, async function (req, res) {
  // const loginUrl = await ssoAdminLoginStart()
  await findAndUpdateCompletedPayments()
  res.json({})
})

export async function handler (event, context) {
  return await app.run(event, context)
}
