import { isLoginPasswordSet } from './auth'
import { getAppConfigAdmin, getAppAuth, getSSOAdminLoginUrl, setAppConfig, triggerPeriodicAdminTask } from './board-api'
import { renderAdminHeader } from './component/admin-header'
import { saveData, clearData, loadData } from './utils'

const renderAdminLogin = () => {
  let html = ''
  html += `
    <div class="container">
        <div class="row">
            <div class="col">
                <h3>Admin Login</h3>
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
const renderAdminDetails = (appAuth, appConfig, adminToken) => {
  let html = ''
  html += `
        <div class="container pt-3">
            <div class="row">
                <div class="col">
                    ${renderAdminHeader()}
                    <form class="admin-form">
                        <div class="row">
                            <div class="col">
                                <h5>App Auth</h5>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <label for="characterId" class="col-sm-2 col-form-label">Character Id</label>
                            <div class="col-sm-4">
                              <input type="text" class="form-control" id="characterId" value="${appAuth.characterId}" disabled>
                            </div>
                            <div class="col-sm-4">
                              <button type="button" class="btn btn-primary login-sso">Update with Admin SSO</button>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <label for="characterName" class="col-sm-2 col-form-label">Character Name</label>
                            <div class="col-sm-4">
                                <input type="text" class="form-control" id="characterName" value="${appAuth.characterName}" disabled>
                            </div>
                        </div>

                        <div class="row mb-3">
                            <label for="corpId" class="col-sm-2 col-form-label">Corp Id</label>
                            <div class="col-sm-4">
                                <input type="text" class="form-control" id="corpId" value="${appAuth.corpId}" disabled>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <label for="corpName" class="col-sm-2 col-form-label">Corp Name</label>
                            <div class="col-sm-4">
                                <input type="text" class="form-control" id="corpName" value="${appAuth.corpName}" disabled>
                            </div>
                        </div>

                        <div class="row mb-3">
                            <label for="accessToken" class="col-sm-2 col-form-label">Access Token</label>
                            <div class="col-sm-4">
                                <input type="text" class="form-control" id="accessToken" value="${appAuth.accessToken}" disabled>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <label for="refreshToken" class="col-sm-2 col-form-label">Refresh Token</label>
                            <div class="col-sm-4">
                                <input type="text" class="form-control" id="refreshToken" value="${appAuth.refreshToken}" disabled>
                            </div>
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
                        <div class="row mb-3">
                            <label for="corpDivision" class="col-sm-2 col-form-label">Corp Wallet Division ID</label>
                            <div class="col-sm-4">
                                <input type="text" class="form-control" id="corpDivisionId" value="${appConfig.corpDivisionId}">
                            </div>
                        </div>
                        <div class="row mb-3">
                            <label for="corpDivision" class="col-sm-2 col-form-label">Corp Wallet Division Name</label>
                            <div class="col-sm-4">
                                <input type="text" class="form-control" id="corpDivisionName" value="${appConfig.corpDivisionName}">
                            </div>
                        </div>
                        <div class="row mb-3">
                            <label for="corpDivision" class="col-sm-2 col-form-label">Discord URL</label>
                            <div class="col-sm-4">
                                <input type="text" class="form-control" id="discordUrl" value="${appConfig.discordUrl}">
                            </div>
                        </div>
                        <div class="row mb-3">
                          <div class="col-sm-6">
                            <button type="submit" class="btn btn-primary save float-end">Save</button>
                          </div>
                          <div class="col-sm-4">
                            <button type="button" class="btn btn-primary trigger-admin-task">Trigger background admin task</button>
                          </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>`
  document.querySelector('.content').innerHTML = html
  document.querySelector('.admin-form').addEventListener('submit', async function (event) {
    event.preventDefault()

    const newAppConfig = {
      listingPrice: parseInt(document.querySelector('#listingPrice').value),
      corpDivisionId: parseInt(document.querySelector('#corpDivisionId').value),
      corpDivisionName: document.querySelector('#corpDivisionName').value,
      discordUrl: document.querySelector('#discordUrl').value
    }
    await setAppConfig(newAppConfig)
  })

  document.querySelector('.admin-form .login-sso').addEventListener('click', async function (event) {
    console.log('login-sso')

    const loginUrl = await getSSOAdminLoginUrl()
    console.log('loginUrl', loginUrl)
    window.location.assign(loginUrl)
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
  document.querySelector('.admin-form .trigger-admin-task').addEventListener('click', async function (event) {
    await triggerPeriodicAdminTask()
  })
}
export const initAdmin = async () => {
  console.log('initAdmin')
  //   clearData('admin-password')
  if (isLoginPasswordSet()) {
    console.log('initAdmin - LOGGED IN')
    const appAuth = await getAppAuth()
    console.log('appAuth', appAuth)
    if (appAuth.error) {
      console.log('BAD LOGIN', appAuth)
      clearData('admin-password')
      initAdmin()
    } else {
      const appConfig = await getAppConfigAdmin()
      console.log('LOGGED IN!!! DATA', appAuth, appConfig)
      const data = loadData()
      renderAdminDetails(appAuth, appConfig, data['admin-token'])
    }
    // TODO is null, password is bad, clear password and reload page
  } else {
    console.log('initAdmin - NOT LOGGED IN')
    // triggerAdminLoginFlow()
    renderAdminLogin()
  }
}
