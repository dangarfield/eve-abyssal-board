import { configCollection } from './db.js'

const ID_APP_CONFIG = 'appConfig'
const ID_APP_AUTH = 'authConfig'

const appConfigDefault = {
  _id: ID_APP_CONFIG,
  listingPrice: 30000000,
  discordUrl: 'http://discord/asfdsadsad',
  corpDivisionId: 2, // Private
  corpDivisionName: 'Abyss Board Listing Fee' // Private
}
const appAuthDefault = {
  _id: ID_APP_AUTH,
  characterId: 1435692323,
  characterName: 'Seraph',
  corpId: 98746847,
  corpName: 'Seph Corp',
  accessToken: 'a',
  refreshToken: 'r'
  // mailListingRequirePayment: {
  //   body: "<font size=\"14\" color=\"#bfffffff\">Thanks for choosing Abyss Board.<br><br>You have listed 3 items.<br>Listing payment is 30m ISK.<br>Right click on this </font><font size=\"14\" color=\"#ffd98d00\"><a href=\"showinfo:2//98746847\">Seph Corp</a></font><font size=\"14\" color=\"#bfffffff\"> and click 'Give Money'.<br><br>Fill in the details as follows:<br><br><b>Account</b>: Abyss Board Income<br><b>Amount</b>: 30000000<br><b>Reason</b>: abc123<br><br><br>Please be careful to fill this information in carefully.<br>It may take up to 1 hour for the transation to be registered and your items listed.<br><br>For any specific questions, contact us on </font><font size=\"14\" color=\"#ffffe400\"><loc><a href=\"http://discord/asfdsadsad\">discord</a></loc></font><font size=\"14\" color=\"#bfffffff\">.<br><br>Thanks</font>",
  //   subject: 'Abyss Board Listing Fee'
  // }
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
    delete appConfig.corpDivisionName
  }
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
