import { Api } from 'eve-esi-swaggerts'
import { getAppAuth, getAppConfig } from './config'
import { updateAndPersistRefreshToken } from './sso'

const esi = new Api()

export const ensureAccessTokenIsValid = async () => {
  console.log('ensureAccessTokenIsValid')
  try {
    const { characterId, accessToken, refreshToken } = await getAppAuth()
    const req = await fetch(`https://esi.evetech.net/verify?token=${accessToken}`)
    const res = await req.json()
    // console.log('verify', res)
    if (res.ExpiresOn && new Date(`${res.ExpiresOn}Z`) - new Date() < 0) {
      // console.log('token expired', res.ExpiresOn, new Date())
      const newAccessToken = await updateAndPersistRefreshToken(refreshToken)
      return { characterId, accessToken: newAccessToken }
    }
    return { characterId, accessToken }
  } catch (error) {
    console.error('ensureAccessTokenIsValid ERROR', error)
    throw new Error('ensureAccessTokenIsValid ERROR')
  }
}
export const sendMail = async (recipient, subject, body) => {
  console.log('sendMail req', recipient, subject, body)

  const { characterId, accessToken } = await ensureAccessTokenIsValid()
  // const { characterId, accessToken } = await getAppAuth()
  // const result = await callWithRetry(esi.characters.postCharactersCharacterIdMail, characterId, {
  console.log('sendMail auth', characterId, accessToken, recipient, subject)
  try {
    const result = await esi.characters.postCharactersCharacterIdMail(characterId, {
      body,
      recipients: [{ recipient_id: recipient, recipient_type: 'character' }],
      subject
    }, { token: accessToken })

    console.log('result', result.data)
  } catch (error) {
    console.log('sendMail ERROR', error)

    // NOTE: There can be some blocked contacts, I think there are a few limits too
  }
}
export const getEvePaymentJournal = async () => {
  // console.log('getEvePaymentJournal')
  const appAuth = await getAppAuth()
  const appConfig = await getAppConfig(true)
  const { accessToken } = await ensureAccessTokenIsValid()

  // console.log('getEvePaymentJournal', characterId, accessToken, appAuth.corpId, appConfig.corpDivisionId)
  try {
    const result = (await esi.corporations.getCorporationsCorporationIdWalletsDivisionJournal(appAuth.corpId, appConfig.corpDivisionId, { token: accessToken })).data
    // console.log('result', result)
    return result
  } catch (error) {
    console.log('getEvePaymentJournal ERROR', error)
    // NOTE: There can be some blocked contacts, I think there are a few limits too
  }
  return []
}