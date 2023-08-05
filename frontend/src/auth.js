import { loadData, saveData, clearData } from './utils'
import { createSSO } from 'eve-sso-pkce'

const SELLER_SCOPES = 'publicData esi-assets.read_assets.v1'.split(' ')
const ADMIN_SCOPES = 'esi-mail.organize_mail.v1 esi-mail.read_mail.v1 esi-mail.send_mail.v1 esi-wallet.read_character_wallet.v1 esi-contracts.read_character_contracts.v1 esi-wallet.read_corporation_wallets.v1 esi-contracts.read_corporation_contracts.v1'.split(' ')

const ssoConfig = window.location.href.includes('localhost')
  ? {
      clientId: 'dc6490d2eafc421a8cc35cf0394d60d1',
      redirectUri: 'http://localhost:3000/#/login/return/'
    }
  : {
      clientId: 'dc6490d2eafc421a8cc35cf0394d60d1',
      redirectUri: 'https://dangarfield.github.io/eve-remap/'
    }

const ssoConfigAdmin = window.location.href.includes('localhost')
  ? {
      clientId: 'e754a650bfb24eda938734b8ddd38679',
      redirectUri: 'http://localhost:3000/#/admin/return/'
    }
  : {
      clientId: 'dc6490d2eafc421a8cc35cf0394d60d1',
      redirectUri: 'https://dangarfield.github.io/eve-remap/'
    }

// console.log('ssoConfig', ssoConfig)
const sso = createSSO(ssoConfig)
const ssoAdmin = createSSO(ssoConfigAdmin)

export const triggerLoginFlow = async (useScopes) => {
  console.log('triggerLoginFlow useScopes', useScopes)
  saveData('returnUrl', window.location.href)
  clearData('codeVerifier')

  let ssoUri
  if (useScopes) {
    ssoUri = await sso.getUri(SELLER_SCOPES)
  } else {
    ssoUri = await sso.getUri()
  }
  saveData('codeVerifier', ssoUri.codeVerifier)
  console.log('ssoUri', ssoUri)
  window.location.assign(ssoUri.uri)
}
export const triggerLoginReturnFlow = async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  const state = urlParams.get('state')

  console.log('triggerLoginReturnFlow', code, state)
  if (code && state) {
    const data = loadData()
    console.log('code', code, 'state', state, 'codeVerifier', data.codeVerifier)
    const token = await sso.getAccessToken(code, data.codeVerifier)
    token.character_id = token.payload.sub.replace('CHARACTER:EVE:', '')
    console.log('token', token)
    saveData('selectedCharacter', token.character_id)
    saveData(`token-${token.character_id}`, token)
    clearData('codeVerifier')
    clearData('returnUrl')
    window.location.assign(data.returnUrl)
  } else {
    // TODO - More robust version of handling failures
    clearData('codeVerifier')
    clearData('returnUrl')
    window.alert('login failed')
  }
}
export const triggerAdminLoginFlow = async () => {
  console.log('triggerAdminLoginFlow useScopes')
  saveData('returnUrl', window.location.href)
  clearData('codeVerifier')
  const ssoUri = await ssoAdmin.getUri(ADMIN_SCOPES)
  saveData('codeVerifier', ssoUri.codeVerifier)
  console.log('ssoUri', ssoUri)
  window.location.assign(ssoUri.uri)
}
export const triggerAdminLoginReturnFlow = async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  const state = urlParams.get('state')

  console.log('triggerAdminLoginReturnFlow', code, state)
  if (code && state) {
    const data = loadData()
    console.log('code', code, 'state', state, 'codeVerifier', data.codeVerifier)
    const token = await ssoAdmin.getAccessToken(code, data.codeVerifier)
    token.character_id = token.payload.sub.replace('CHARACTER:EVE:', '')
    console.log('token', token)
    saveData('selectedCharacter', token.character_id)
    saveData('admin-token', token)
    clearData('codeVerifier')
    clearData('returnUrl')
    window.location.assign(data.returnUrl)
  } else {
    // TODO - More robust version of handling failures
    clearData('codeVerifier')
    clearData('returnUrl')
    window.alert('login failed')
  }
}
export const getCurrentUserDetails = () => {
  const data = loadData()
  //   console.log('data', data)
  const characterId = data.selectedCharacter
  if (characterId === undefined) return false
  const tokenData = data[`token-${characterId}`]
  const characterName = tokenData.payload.name
  return { characterId, characterName }
}
export const getCurrentUserAccessToken = () => {
  const data = loadData()
  const characterId = data.selectedCharacter
  const accessToken = data[`token-${characterId}`].access_token
  const jwt = data[`token-${characterId}`].payload
  console.log('getCurrentUserAccessToken', characterId)
  return { characterId, accessToken, jwt }
}
export const refreshTokenAndGetNewUserAccessToken = async () => {
  const data = loadData()
  console.log('refreshTokenAndGetNewUserAccessToken')
  const characterId = data.selectedCharacter
  const refreshToken = data[`token-${characterId}`].refresh_token
  const newToken = await sso.refreshToken(refreshToken)
  newToken.character_id = newToken.payload.sub.replace('CHARACTER:EVE:', '')
  console.log('newToken', newToken)
  saveData(`token-${characterId}`, newToken)
  // TODO alert('refresh')
}
export const switchUser = (characterId) => {
  console.log('switchUser', characterId)
  const data = loadData()
  if (data.selectedCharacter !== characterId) {
    saveData('selectedCharacter', characterId)
    window.location.reload()
  }
}

const areListsEqual = (list1, list2) => {
  const sortedList1 = list1.slice().sort().join(',')
  const sortedList2 = list2.slice().sort().join(',')
  return sortedList1 === sortedList2
}

export const doesCurrentCharacterHaveSellerScope = () => {
  const data = loadData()
  const characterId = data.selectedCharacter
  if (characterId === undefined) return false
  const scopes = data[`token-${characterId}`].payload.scp
  if (scopes && areListsEqual(scopes, SELLER_SCOPES)) {
    return true
  } else {
    return false
  }
}
export const isLoginPasswordSet = () => {
  // clearData('admin-token')
  const data = loadData()
  return data['admin-password'] !== undefined
}
export const fetchWithRetry = async (url, fetchOptions, maxRetries = 3) => {
  let retries = 0
  let response = null
  while (retries < maxRetries) {
    try {
      const req = await window.fetch(url, fetchOptions)
      response = await req.json()
      if (response.error) {
        console.log('response.error', response.error)
        window.location.hash = '#/error'
        throw new Error(response.error)
      } else if (response.expired) {
        console.log('Token expired')
        await refreshTokenAndGetNewUserAccessToken()
      } else {
        return response
      }
    } catch (error) {
      console.error('Error during fetch:', error)
    }
    retries++
  }
  window.location.hash = '#/error'
  throw new Error('Max retries exceeded')
}
