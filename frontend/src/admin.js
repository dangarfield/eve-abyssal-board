import { isLoginPasswordSet, triggerAdminLoginFlow } from './auth'
import { getAppConfig, getCorpCharacterConfig, setAppConfig, setCorpCharacterConfig } from './board-api'
import { saveData, clearData, loadData } from './utils'

const renderAdminLogin = () => {
  let html = ''
  html += `
    <div class="container">
        <div class="row">
            <div class="col">
                <h3>Admin</h3>
                <form class="row gx-3 gy-2 align-items-center password-form">
                    <div class="col-sm-3">
                        <input type="text" class="form-control password" placeholder="Admin password">
                    </div>
                    <div class="col-auto">
                        <button type="submit" class="btn btn-primary">Login</button>
                    </div>
                </form>
            </div>
        </div>
    </div>`
  document.querySelector('.content').innerHTML = html

  document.querySelector('.password-form').addEventListener('submit', function (event) {
    event.preventDefault()
    const password = document.querySelector('.password-form .password').value
    saveData('admin-password', password)
    console.log('event', event, password)
    initAdmin()
  })
}
const renderAdminDetails = (corpCharacterConfig, appConfig, adminToken) => {
  let html = ''
  html += `
        <div class="container">
            <div class="row">
                <div class="col">
                    <h3>Admin</h3>
                    <form class="admin-form">
                        <div class="row">
                            <div class="col">
                                <h5>Corp Character Config</h5>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <label for="characterId" class="col-sm-2 col-form-label">Character Id</label>
                            <div class="col-sm-4">
                            <input type="text" class="form-control" id="characterId" value="${corpCharacterConfig.characterId}">
                            </div>
                            ${adminToken
? `
                            <div class="col-sm-2">
                                <button type="button" class="btn btn-primary w-100 transfer-sso"><i class="bi bi-arrow-left"></i> Transfer <i class="bi bi-arrow-left"></i></button>
                            </div>
                            <div class="col-sm-4">
                                <input type="text" class="form-control" id="characterId-sso" value="${adminToken.character_id}" disabled>
                            </div>
                            `
: ''}
                        </div>
                        <div class="row mb-3">
                            <label for="characterName" class="col-sm-2 col-form-label">Character Name</label>
                            <div class="col-sm-4">
                                <input type="text" class="form-control" id="characterName" value="${corpCharacterConfig.characterName}">
                            </div>
                            ${adminToken
? `
                            <div class="col-sm-4 offset-sm-2">
                                <input type="text" class="form-control" id="characterName-sso" value="${adminToken.payload.name}" disabled>
                            </div>
                            `
: ''}
                        </div>

                        <div class="row mb-3">
                            <label for="corpId" class="col-sm-2 col-form-label">Corp Id</label>
                            <div class="col-sm-4">
                                <input type="text" class="form-control" id="corpId" value="${corpCharacterConfig.corpId}">
                            </div>
                            ${adminToken
? `
                            <div class="col-sm-4 offset-sm-2">
                                <input type="text" class="form-control" id="corpId-sso" value="${adminToken.corpId}" disabled>
                            </div>
                            `
: ''}
                        </div>
                        <div class="row mb-3">
                            <label for="corpName" class="col-sm-2 col-form-label">Corp Name</label>
                            <div class="col-sm-4">
                                <input type="text" class="form-control" id="corpName" value="${corpCharacterConfig.corpName}">
                            </div>
                            ${adminToken
? `
                            <div class="col-sm-4 offset-sm-2">
                                <input type="text" class="form-control" id="corpName-sso" value="${adminToken.corpName}" disabled>
                            </div>
                            `
: ''}
                        </div>
                        <div class="row mb-3">
                            <label for="corpDivision" class="col-sm-2 col-form-label">Corp Wallet Division</label>
                            <div class="col-sm-4">
                                <input type="text" class="form-control" id="corpDivision" value="${corpCharacterConfig.corpDivision}">
                            </div>
                        </div>

                        <div class="row mb-3">
                            <label for="accessToken" class="col-sm-2 col-form-label">Access Token</label>
                            <div class="col-sm-4">
                                <input type="text" class="form-control" id="accessToken" value="${corpCharacterConfig.accessToken}">
                            </div>
                            ${adminToken
? `
                            <div class="col-sm-4 offset-sm-2">
                                <input type="text" class="form-control" id="accessToken-sso" value="${adminToken.access_token}" disabled>
                            </div>
                            `
: ''}
                        </div>
                        <div class="row mb-3">
                            <label for="refreshToken" class="col-sm-2 col-form-label">Refresh Token</label>
                            <div class="col-sm-4">
                                <input type="text" class="form-control" id="refreshToken" value="${corpCharacterConfig.refreshToken}">
                            </div>
                            ${adminToken
? `
                            <div class="col-sm-4 offset-sm-2">
                                <input type="text" class="form-control" id="refreshToken-sso" value="${adminToken.refresh_token}" disabled>
                            </div>
                            `
: ''}
                        </div>

                        <div class="row">
                            <div class="col">
                                <h5>App Config</h5>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <label for="listingPrice" class="col-sm-2 col-form-label">Listing Price</label>
                            <div class="col-sm-4">
                            <input type="text" class="form-control" id="listingPrice" value="${appConfig.listingPrice}">
                            </div>
                        </div>
                        <button type="button" class="btn btn-primary login-sso">Login Admin SSO</button>
                        <button type="button" class="btn btn-primary clear-sso">Clear Admin SSO</button>
                        <button type="submit" class="btn btn-primary save">Save</button>
                    </form>
                </div>
            </div>
        </div>`
  document.querySelector('.content').innerHTML = html
  document.querySelector('.admin-form').addEventListener('submit', async function (event) {
    event.preventDefault()

    const newAppConfig = {
      listingPrice: parseInt(document.querySelector('#listingPrice').value)
    }
    await setAppConfig(newAppConfig)

    const corpCharacterConfig = {
      characterId: parseInt(document.querySelector('#characterId').value),
      characterName: document.querySelector('#characterName').value,
      corpId: parseInt(document.querySelector('#corpId').value),
      corpName: document.querySelector('#corpName').value,
      corpDivision: parseInt(document.querySelector('#corpDivision').value),
      accessToken: document.querySelector('#accessToken').value,
      refreshToken: document.querySelector('#refreshToken').value
    }
    await setCorpCharacterConfig(corpCharacterConfig)
  })
  document.querySelector('.admin-form .clear-sso').addEventListener('click', function (event) {
    console.log('clear-sso')
    clearData('admin-token')
    initAdmin()
  })
  document.querySelector('.admin-form .login-sso').addEventListener('click', function (event) {
    console.log('login-sso')
    triggerAdminLoginFlow()
  })
  const transferSsoEle = document.querySelector('.admin-form .transfer-sso')
  if (transferSsoEle) {
    transferSsoEle.addEventListener('click', function (event) {
      console.log('transferSsoEle')
      document.querySelector('#characterId').value = document.querySelector('#characterId-sso').value
      document.querySelector('#characterName').value = document.querySelector('#characterName-sso').value
      document.querySelector('#corpId').value = document.querySelector('#corpId-sso').value
      document.querySelector('#corpName').value = document.querySelector('#corpName-sso').value
      document.querySelector('#accessToken').value = document.querySelector('#accessToken-sso').value
      document.querySelector('#refreshToken').value = document.querySelector('#refreshToken-sso').value
    })
  }
}
export const initAdmin = async () => {
  console.log('initAdmin')
  //   clearData('admin-password')
  if (isLoginPasswordSet()) {
    console.log('initAdmin - LOGGED IN')
    const corpCharacterConfig = await getCorpCharacterConfig()
    console.log('corpCharacterConfig', corpCharacterConfig)
    if (corpCharacterConfig.error) {
      console.log('BAD LOGIN', corpCharacterConfig)
      clearData('admin-password')
      initAdmin()
    } else {
      const appConfig = await getAppConfig()
      console.log('LOGGED IN!!! DATA', corpCharacterConfig, appConfig)
      const data = loadData()
      renderAdminDetails(corpCharacterConfig, appConfig, data['admin-token'])
    }
    // TODO is null, password is bad, clear password and reload page
  } else {
    console.log('initAdmin - NOT LOGGED IN')
    // triggerAdminLoginFlow()
    renderAdminLogin()
  }
}
