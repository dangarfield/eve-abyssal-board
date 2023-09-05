import crypto from 'crypto'
import url from 'url'
import { configCollection } from './db'
import jsonwebtoken from 'jsonwebtoken'
import { Api } from 'eve-esi-swaggerts'
import { setAppAuth, getAppAuth } from './config'

const esi = new Api()
const CLIENT_ID = process.env.CLIENT_ID
const RETURN_URL_ROOT = process.env.RETURN_URL_ROOT
const ADMIN_SCOPES = 'esi-mail.organize_mail.v1 esi-mail.read_mail.v1 esi-mail.send_mail.v1 esi-wallet.read_character_wallet.v1 esi-contracts.read_character_contracts.v1 esi-wallet.read_corporation_wallets.v1 esi-contracts.read_corporation_contracts.v1'
const RETURN_URL = RETURN_URL_ROOT + '/api/sso/return'

const base64urlEncode = (buffer) => {
  return buffer.toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

const generateCodeVerifierAndChallenge = async () => {
  const codeVerifier = crypto.randomBytes(32)
  const base64urlCodeVerifier = base64urlEncode(codeVerifier)
  const codeChallenge = crypto.createHash('sha256').update(base64urlCodeVerifier).digest()
  const base64urlCodeChallenge = base64urlEncode(codeChallenge)

  return {
    codeVerifier: base64urlCodeVerifier,
    codeChallenge: base64urlCodeChallenge
  }
}

export const ssoAdminLoginStart = async () => {
  const { codeVerifier, codeChallenge } = await generateCodeVerifierAndChallenge()

  // await configCollection.insertOne({ _id: 'codeVerifier', codeVerifier })

  const doc = { _id: 'codeVerifier', codeVerifier }
  await configCollection.findOneAndReplace({ _id: doc._id }, doc, { upsert: true })
  const form = new URLSearchParams()
  form.append('response_type', 'code')
  form.append('redirect_uri', RETURN_URL)
  form.append('client_id', CLIENT_ID)
  form.append('scope', ADMIN_SCOPES)
  form.append('code_challenge', codeChallenge)
  form.append('code_challenge_method', 'S256')
  form.append('state', 'something')

  const urlPath = 'https://login.eveonline.com/v2/oauth/authorize/'

  const loginUrl = url.format({ pathname: urlPath, search: form.toString() })
  console.log('ssoAdminLoginStart', loginUrl, codeVerifier, codeChallenge)
  return loginUrl
}
export const ssoAdminReturn = async (code, state) => {
  console.log('ssoAdminReturn', code, state)

  const deleteResult = await configCollection.findOneAndDelete({ _id: 'codeVerifier' })
  const codeVerifier = deleteResult.value.codeVerifier

  const form = new URLSearchParams()
  form.append('grant_type', 'authorization_code')
  form.append('code', code)
  form.append('client_id', CLIENT_ID)
  form.append('code_verifier', codeVerifier)

  const urlPath = 'https://login.eveonline.com/v2/oauth/token'

  console.log('ssoAdminReturn return post', urlPath, form)

  try {
    const req = await fetch(urlPath, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Host: 'login.eveonline.com'
      },
      body: form.toString()
    })
    const res = await req.json()
    console.log('res', res)

    const accessToken = res.access_token
    const refreshToken = res.refresh_token
    const payload = jsonwebtoken.decode(accessToken)
    const characterId = parseInt(payload.sub.replace('CHARACTER:EVE:', ''))
    const characterName = payload.name
    const corpId = (await esi.characters.postCharactersAffiliation([characterId])).data[0].corporation_id
    const corpName = (await esi.corporations.getCorporationsCorporationId(corpId)).data.name

    const newAuth = { characterId, characterName, corpId, corpName, accessToken, refreshToken }
    console.log('newAuth', newAuth)
    await setAppAuth(newAuth)
  } catch (error) {
    console.log('error', error)
  }
}

export const updateAndPersistRefreshToken = async (refreshToken) => {
  const form = new URLSearchParams()
  form.append('grant_type', 'refresh_token')
  form.append('refresh_token', refreshToken)
  form.append('client_id', CLIENT_ID)

  // const auth = 'Basic ' + Buffer.from(CLIENT_ID + ':' + SECRET).toString('base64')

  console.log('refreshToken', refreshToken, form)

  const req = await fetch('https://login.eveonline.com/v2/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Host: 'login.eveonline.com'
      // Authorization: auth
    },
    body: form
  })
  const res = await req.json()
  console.log('refreshToken res', res)
  const appAuth = await getAppAuth()
  appAuth.accessToken = res.access_token
  appAuth.refreshToken = res.refresh_token
  await setAppAuth(appAuth)

  // TODO - Persist these
  return appAuth.accessToken
}
