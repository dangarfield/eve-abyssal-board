// TODO - Replace with persistent storage
let appConfig = {
  listingPrice: 30000000
}
let corpCharacterConfig = {
  characterId: 1435692323,
  characterName: 'Seraph',
  corpId: 98746847,
  corpName: 'Seph Corp',
  corpDivision: 2,
  accessToken: 'a',
  refreshToken: 'r'
  // mailListingRequirePayment: {
  //   body: "<font size=\"14\" color=\"#bfffffff\">Thanks for choosing Abyss Board.<br><br>You have listed 3 items.<br>Listing payment is 30m ISK.<br>Right click on this </font><font size=\"14\" color=\"#ffd98d00\"><a href=\"showinfo:2//98746847\">Seph Corp</a></font><font size=\"14\" color=\"#bfffffff\"> and click 'Give Money'.<br><br>Fill in the details as follows:<br><br><b>Account</b>: Abyss Board Income<br><b>Amount</b>: 30000000<br><b>Reason</b>: abc123<br><br><br>Please be careful to fill this information in carefully.<br>It may take up to 1 hour for the transation to be registered and your items listed.<br><br>For any specific questions, contact us on </font><font size=\"14\" color=\"#ffffe400\"><loc><a href=\"http://discord/asfdsadsad\">discord</a></loc></font><font size=\"14\" color=\"#bfffffff\">.<br><br>Thanks</font>",
  //   subject: 'Abyss Board Listing Fee'
  // }

}
export const getAppConfig = async () => {
  return appConfig
}
export const setAppConfig = async (newAppConfig) => {
  appConfig = newAppConfig
  return appConfig
}
export const getCorpCharacterConfig = async () => {
  return corpCharacterConfig
}
export const setCorpCharacterConfig = async (newCorpCharacterConfig) => {
  corpCharacterConfig = newCorpCharacterConfig
  return corpCharacterConfig
}
