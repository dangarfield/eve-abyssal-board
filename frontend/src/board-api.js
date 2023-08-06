import { getCurrentUserAccessToken, fetchWithRetry } from './auth'
import { loadData } from './utils'

const API_ROOT = ''// 'http://localhost:3001'
let appConfig
// Example usage:
export const getCurrentUserListedItems = async () => {
  const { characterId, accessToken } = getCurrentUserAccessToken()
  const url = `${API_ROOT}/api/seller/${characterId}/items`

  const res = await fetchWithRetry(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    }
  })
  console.log('getCurrentUserListedItems', characterId, accessToken, res)
  return res
}

export const getAppConfig = async (forceRefresh) => {
  if (appConfig !== undefined && !forceRefresh) return appConfig
  const req = await window.fetch(`${API_ROOT}/api/app-config`)
  const res = await req.json()
  appConfig = res
  console.log('appConfig', appConfig)
  return appConfig
}
export const setAppConfig = async (newAppConfig) => {
  const data = loadData()
  console.log('setAppConfig', newAppConfig)
  const req = await window.fetch(`${API_ROOT}/api/app-config`, {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `${data['admin-password']}`
    },
    body: JSON.stringify(newAppConfig)
  })
  appConfig = await req.json()
}
export const getCorpCharacterConfig = async () => {
  const data = loadData()
  const req = await window.fetch(`${API_ROOT}/api/corp-char-config`, {
    method: 'GET',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `${data['admin-password']}`
    }
  })
  const corpCharacterConfig = await req.json()
  console.log('getCorpCharacterConfig', corpCharacterConfig)
  return corpCharacterConfig
}

export const setCorpCharacterConfig = async (corpCharacterConfig) => {
  const data = loadData()
  console.log('setCorpCharacterConfig', corpCharacterConfig)
  await window.fetch(`${API_ROOT}/api/corp-char-config`, {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `${data['admin-password']}`
    },
    body: JSON.stringify(corpCharacterConfig)
  })
}
