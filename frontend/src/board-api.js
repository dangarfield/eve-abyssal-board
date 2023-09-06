import { getCurrentUserAccessToken, fetchWithRetry } from './auth'
import { loadData } from './utils'

const API_ROOT = ''
let appConfig

export const getTypeIDCounts = async () => {
  const req = await window.fetch(`${API_ROOT}/api/stats`)
  const res = await req.json()
  return res
}

export const getCurrentSellerInventory = async () => {
  const { characterId } = await getCurrentUserAccessToken()
  return getSellerInventory(characterId)
}
export const getSellerInventory = async (characterId) => {
  const { accessToken } = await getCurrentUserAccessToken()
  const url = `${API_ROOT}/api/sellers/${characterId}/inventory`

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
  const { accessToken } = await getCurrentUserAccessToken()
  const url = `${API_ROOT}/api/sellers/@me/payments`
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
export const getCurrentSellerData = async () => {
  const { accessToken } = await getCurrentUserAccessToken()
  const url = `${API_ROOT}/api/sellers/@me`
  const res = await fetchWithRetry(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    }
  })
  return res
}
export const setCurrentSellerData = async (data) => {
  const { accessToken } = await getCurrentUserAccessToken()
  const url = `${API_ROOT}/api/sellers/@me`
  const res = await fetchWithRetry(url, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(data)
  })
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

export const initiateListingFlow = async (inventoryItems) => {
  const { accessToken } = await getCurrentUserAccessToken()
  const url = `${API_ROOT}/api/listing`
  const res = await fetchWithRetry(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(inventoryItems)
  })
  console.log('initialListing res', res)
  return res
}
export const cancelListing = async (itemID) => {
  const { accessToken } = await getCurrentUserAccessToken()
  const url = `${API_ROOT}/api/listing/${itemID}`

  const res = await fetchWithRetry(url, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    }
  })
  console.log('cancelListing res', res)
  return res
}
export const amendListing = async (itemID, amend) => {
  const { accessToken } = await getCurrentUserAccessToken()
  const url = `${API_ROOT}/api/listing/${itemID}`

  const res = await fetchWithRetry(url, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(amend)
  })
  console.log('amendListing res', res)
  return res
}

export const searchForModulesOfType = async (typeId, query) => {
  const res = await fetchWithRetry(`${API_ROOT}/api/search/${typeId}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(query)
  })
  console.log('searchTypes', res)
  return res
}

// ADMIN FUNCTIONS
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
  for (const p of res.journal) {
    p.date = new Date(p.date).toLocaleString() // Not easily sortable...
  }
  res.lastModified = new Date(res.lastModified)
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
