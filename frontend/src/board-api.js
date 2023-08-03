import { getCurrentUserAccessToken, fetchWithRetry } from './auth'

const API_ROOT = 'http://localhost:3001'

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
