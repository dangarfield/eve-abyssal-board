import API from 'lambda-api'
import { getAppConfig, setAppConfig, getCorpCharacterConfig, setCorpCharacterConfig } from '../utils/config'
import { verifyAdmin, verifyToken } from '../utils/auth'
import { getSellerListings } from '../utils/listings'
const app = API()

app.get('/api/seller/:characterId/items', verifyToken, async function (req, res) {
  const characterId = req.params.characterId
  console.log('/api/seller/:characterId/items', characterId, 'auth', req.auth.characterId, req.auth.characterName)
  res.json((await getSellerListings(characterId)))
})
app.get('/api/inventory/:characterId', verifyToken, async function (req, res) {
  const characterId = req.params.characterId
  console.log('/api/inventory/:characterId', characterId, 'auth', req.auth.characterId, req.auth.characterName)
  res.json((await getSellerListings(characterId)))
})

app.get('/api/app-config', async (req, res) => {
  return await getAppConfig()
})
app.post('/api/app-config', async (req, res) => {
  return await setAppConfig(req.body)
})
app.get('/api/corp-char-config', verifyAdmin, async function (req, res) {
  res.json((await getCorpCharacterConfig()))
})
app.post('/api/corp-char-config', verifyAdmin, async function (req, res) {
  res.json((await setCorpCharacterConfig(req.body)))
})

export async function handler (event, context) {
  return await app.run(event, context)
}
