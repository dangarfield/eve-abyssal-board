import { getCurrentUserAccessToken, fetchWithRetry } from './auth'

const API_ROOT = 'http://localhost:3001'
let appConfig
// Example usage:
export const getCurrentUserListedItems = async () => {
  const { characterId, accessToken } = getCurrentUserAccessToken()
  const url = `${API_ROOT}/api/seller/${characterId}/items`

  const fetchOptions = {
    method: 'GET',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    }
  }

  const res = await fetchWithRetry(url, fetchOptions)
  console.log('getCurrentUserListedItems', characterId, accessToken, res)
  return res
}

export const getAppConfig = async () => {
  if (appConfig !== undefined) return appConfig
  const req = await window.fetch(`${API_ROOT}/api/app-config`)
  const res = await req.json()
  appConfig = res
  console.log('appConfig', appConfig)
  return appConfig
}
