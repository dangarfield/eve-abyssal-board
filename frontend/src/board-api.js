import { getCurrentUserAccessToken, fetchWithRetry } from './auth'
import { loadData } from './utils'

const API_ROOT = ''// 'http://localhost:3001'
let appConfig
// Example usage:
export const getCurrentSellerInventory = async () => {
  const { characterId } = getCurrentUserAccessToken()
  return getSellerInventory(characterId)
}
export const getSellerInventory = async (characterId) => {
  const { accessToken } = getCurrentUserAccessToken()
  const url = `${API_ROOT}/api/seller/${characterId}/inventory`

  const res = await fetchWithRetry(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    }
  })
  // console.log('getSellerInventory', characterId, accessToken, res)
  return res
}
export const getCurrentSellerPayments = async () => {
  const { accessToken } = getCurrentUserAccessToken()
  const url = `${API_ROOT}/api/seller/@me/payments`

  const res = await fetchWithRetry(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    }
  })
  // console.log('getSellerPayments', characterId, res)
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
export const getAppConfigAdmin = async () => {
  const data = loadData()
  const req = await window.fetch(`${API_ROOT}/api/app-config/admin`, {
    method: 'GET',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `${data['admin-password']}`
    }
  })
  const res = await req.json()
  return res
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
export const getAppAuth = async () => {
  const data = loadData()
  const req = await window.fetch(`${API_ROOT}/api/app-auth`, {
    method: 'GET',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `${data['admin-password']}`
    }
  })
  const appAuth = await req.json()
  console.log('getAppAuth', appAuth)
  return appAuth
}

export const initiateListingFlow = async (inventoryItems) => {
  const { accessToken } = getCurrentUserAccessToken()
  const url = `${API_ROOT}/api/listing`

  const req = await window.fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(inventoryItems)
  })
  const res = await req.json()
  console.log('initialListing res', req)
  return res
}
export const getSSOAdminLoginUrl = async () => {
  const data = loadData()
  const req = await window.fetch(`${API_ROOT}/api/sso/login`, {
    method: 'GET',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `${data['admin-password']}`
    }
  })
  const res = await req.json()
  console.log('getSSOAdminLoginUrl', res)
  return res.loginUrl
}
