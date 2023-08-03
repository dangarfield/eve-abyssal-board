import express from 'express'
import cors from 'cors'
import { getSellerListings } from './listings.js'

const app = express()
const PORT = 3001

app.use(express.json())
app.use(cors())

const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers.authorization
  if (typeof bearerHeader === 'undefined') {
    res.status(403).json({ error: 'missing-token' })
    return
  }
  const token = bearerHeader.split(' ')[1]
  //   console.log('verifyToken', token)
  fetch(`https://esi.evetech.net/verify/?token=${token}`)
    .then(vReq => vReq.json())
    .then(vRes => {
      if (vRes.error) {
        res.status(403).json(vRes)
      } else if (vRes.ExpiresOn && new Date(`${vRes.ExpiresOn}Z`) - new Date() < 0) {
        res.status(403).json({ expired: 'token-expired' })
      } else {
        req.auth = {
          characterId: vRes.CharacterID,
          characterName: vRes.CharacterName
        }
        next()
      }
    })
}

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

app.listen(PORT, function (err) {
  if (err) console.log(err)
  console.log('Server listening on PORT', PORT)
})
