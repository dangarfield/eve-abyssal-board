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
  for (const p of res) {
    p.creationDate = new Date(p.creationDate)
  }
  res.sort((a, b) => b.creationDate - a.creationDate)
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
  console.log('initialListing res', res)
  return res
}
export const cancelListing = async (itemId) => {
  const { accessToken } = getCurrentUserAccessToken()
  const url = `${API_ROOT}/api/listing/${itemId}`

  const req = await window.fetch(url, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    }
  })
  const res = await req.json()
  console.log('cancelListing res', res)
  return res
}
export const amendListing = async (itemId, amend) => {
  const { accessToken } = getCurrentUserAccessToken()
  const url = `${API_ROOT}/api/listing/${itemId}`

  const req = await window.fetch(url, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(amend)
  })
  const res = await req.json()
  console.log('amendListing res', res)
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
export const triggerPeriodicAdminTask = async () => {
  const data = loadData()
  const req = await window.fetch(`${API_ROOT}/api/admin-task`, {
    method: 'GET',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `${data['admin-password']}`
    }
  })
  const res = await req.json()
  console.log('triggerPeriodicAdminTask', res)
}
export const getPendingPaymentsAdmin = async (filter) => {
  const data = loadData()
  const req = await window.fetch(`${API_ROOT}/api/payments/pending`, {
    method: 'GET',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `${data['admin-password']}`
    },
    body: JSON.stringify(filter)
  })
  const res = await req.json()
  console.log('getPendingPaymentsAdmin', res)
  for (const p of res) {
    p.creationDate = new Date(p.creationDate).toLocaleString() // Not easily sortable...
  }
  return res
}
export const getCompletePaymentsAdmin = async (filter) => {
  const data = loadData()
  const req = await window.fetch(`${API_ROOT}/api/payments/complete`, {
    method: 'GET',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `${data['admin-password']}`
    },
    body: JSON.stringify(filter)
  })
  const res = await req.json()
  console.log('getCompletePaymentsAdmin', res)
  return res
}
export const getJournalAdmin = async (filter) => {
  const data = loadData()
  const req = await window.fetch(`${API_ROOT}/api/journal`, {
    method: 'GET',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `${data['admin-password']}`
    }
  })
  const res = await req.json()
  for (const p of res) {
    p.date = new Date(p.date).toLocaleString() // Not easily sortable...
  }
  console.log('getJournalAdmin', res)
  return res
}
export const cancelPayment = async (paymentId) => {
  const data = loadData()
  const req = await window.fetch(`${API_ROOT}/api/payments/${paymentId}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `${data['admin-password']}`
    }
  })
  const res = await req.json()
  console.log('cancelPayment', res)
  return res
}

export const updatePayment = async (paymentId, update) => {
  const data = loadData()
  const req = await window.fetch(`${API_ROOT}/api/payments/${paymentId}`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `${data['admin-password']}`
    },
    body: JSON.stringify(update)
  })
  const res = await req.json()
  console.log('updatePayment', res)
  return res
}
