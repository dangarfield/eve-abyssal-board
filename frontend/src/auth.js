import { loadData, saveData, clearData, showModalAlert } from './utils'
import { createSSO } from 'eve-sso-pkce'

const SELLER_SCOPES = 'publicData esi-assets.read_assets.v1 esi-ui.open_window.v1'.split(' ')
const BUYER_SCOPES = ['esi-ui.open_window.v1']// .split(' ')

const ssoConfig = window.location.href.includes('localhost')
  ? {
      clientId: 'dc6490d2eafc421a8cc35cf0394d60d1',
      redirectUri: 'http://localhost:8888/login/return/'
    }
  : {
      clientId: '63adc68f3b214e63a79b2b612e4c4a10',
      redirectUri: 'https://abyssalboard.netlify.app/login/return/'
    }

// console.log('ssoConfig', ssoConfig)
const sso = createSSO(ssoConfig)

export const triggerLoginFlow = async (useScopes) => {
  console.log('triggerLoginFlow useScopes', useScopes)
  if (!useScopes) {
    await showModalAlert('EVE Online SSO', `
    <p>We only ask for one permission when signing in as a buyer:</p>
    <div class="alert alert-info fade show" role="alert">
      <code>esi-ui.open_window.v1</code> - We can quickly create an EVE mail draft for you with your an in game link to your chosen module and the sellers' contact details
    </div>
    <p><i>Note: No information is sent or used by Abyssal Board.
      This includes refresh tokens. They are all persisted in your browser and not on any Abyss Board servers. We have no way of refreshing your tokens ourselves.</i></p>
    `)
  }

  saveData('returnUrl', window.location.href)
  clearData('codeVerifier')

  let ssoUri
  if (useScopes) {
    ssoUri = await sso.getUri(SELLER_SCOPES)
  } else {
    ssoUri = await sso.getUri(BUYER_SCOPES)
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

export const getCurrentUserDetails = () => {
  const data = loadData()
  //   console.log('data', data)
  const characterId = data.selectedCharacter
  if (characterId === undefined) return false
  const tokenData = data[`token-${characterId}`]
  const characterName = tokenData.payload.name
  return { characterId, characterName }
}
export const getCurrentUserAccessToken = async () => {
  let data = loadData()

  const characterId = data.selectedCharacter

  if ((new Date().getTime() / 1000) > data[`token-${characterId}`].payload.exp) {
    console.log('Need to refresh')
    await refreshTokenAndGetNewUserAccessToken()
    data = loadData()
  }

  const accessToken = data[`token-${characterId}`].access_token
  const jwt = data[`token-${characterId}`].payload
  // console.log('getCurrentUserAccessToken', accessToken)
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
  let scopes = data[`token-${characterId}`].payload.scp
  if (!Array.isArray(scopes)) scopes = [scopes]
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
        window.location.assign('/error')
        throw new Error(response.error)
      } else if (response.expired) {
        console.log('Token expired')
        await refreshTokenAndGetNewUserAccessToken()
        // TODO - load token
        const { accessToken } = await getCurrentUserAccessToken()
        fetchOptions.headers.Authorization = `Bearer ${accessToken}`
      } else {
        return response
      }
    } catch (error) {
      console.error('Error during fetch:', error)
    }
    retries++
  }
  window.location.assign('/error')
  throw new Error('Max retries exceeded')
}
