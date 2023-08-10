import { configCollection } from './db.js'

const ID_APP_CONFIG = 'appConfig'
const ID_APP_AUTH = 'authConfig'

const appConfigDefault = {
  _id: ID_APP_CONFIG,
  listingPrice: 30000000,
  discordUrl: 'http://discord/asfdsadsad',
  corpDivisionId: 2, // Private
  corpDivisionName: 'Abyss Board Payments'
}
const appAuthDefault = {
  _id: ID_APP_AUTH,
  characterId: 1435692323,
  characterName: 'Seraph',
  corpId: 98746847,
  corpName: 'Seph Corp',
  accessToken: 'a',
  refreshToken: 'r'
}
export const getAppConfig = async (showPrivateFields) => {
  console.log('getAppConfig')
  let appConfig = await configCollection.findOne({ _id: ID_APP_CONFIG })
  if (!appConfig) {
    await configCollection.insertOne(appConfigDefault)
    appConfig = appConfigDefault
  }
  delete appConfig._id
  if (!showPrivateFields) {
    delete appConfig.corpDivisionId
    // delete appConfig.corpDivisionName
  }
  const appAuth = await getAppAuth()
  appConfig.corpName = appAuth.corpName
  return appConfig
}
export const setAppConfig = async (newAppConfig) => {
  await configCollection.updateOne({ _id: ID_APP_CONFIG }, { $set: newAppConfig })
  return newAppConfig
}
export const getAppAuth = async () => {
  let appAuth = await configCollection.findOne({ _id: ID_APP_AUTH })
  if (!appAuth) {
    const res = await configCollection.insertOne(appAuthDefault)
    console.log('getAppAuth', res, 'res')
    appAuth = appAuthDefault
  }
  delete appAuth._id
  return appAuth
}
export const setAppAuth = async (newCorpCharacterConfig) => {
  await configCollection.updateOne({ _id: ID_APP_AUTH }, { $set: newCorpCharacterConfig })
  return newCorpCharacterConfig
}
