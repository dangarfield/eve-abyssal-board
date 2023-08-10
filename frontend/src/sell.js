import { doesCurrentCharacterHaveSellerScope, getCurrentUserDetails, triggerLoginFlow } from './auth'
import { getCurrentUserInventory } from './board-api'
import { renderInventoryCard } from './component/inventory-card'

const askForSellerScopePermission = () => {
  const html = `
    <div class="container">
        <div class="row">
            <div class="col text-center">
                <h1>Abyssal Board</h1>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <div class="alert alert-warning" role="alert">
                    <p>In order to sell with us, we need to ask for permission to view your assets.</p>
                    <p>Click below to log in with EVE Online Single Sign On and it will ask for these specfic permissions</p>
                    <button class="btn p-0 border-0 login-seller">
                        <img src="https://web.ccpgamescdn.com/eveonlineassets/developers/eve-sso-login-white-small.png"
                            alt="EVE SSO Login Buttons Small Black">
                    </button>
                </div>
                <div class="alert alert-info" role="alert">
                    <p>Scopes used:</p>
                    <ul>
                        <li><b>esi-assets.read_assets.v1</b> - Identifies the assets in your characters.
                        These are filtered by abyssal types and presented to you for you to automatically create a listing</li>
                    </ul>

                    <p><i>Note: No information is sent or used by Abyssal Board other than identifying and validating the items for sale. All source code is available</a></p>
                </div>
            </div>
        </div>
    </div>
    `
  document.querySelector('.content').innerHTML = html

  document.querySelector('.login-seller').addEventListener('click', () => {
    triggerLoginFlow(true)
  })
}

const renderSellerPlaceholder = (userDetails) => {
  let html = `
    <div class="container">
        <div class="row">
            <div class="col">
                <div class="d-grid gap-2 d-md-flex justify-content-between">
                    <h1>Hi ${userDetails.characterName}! Here are your mod listings!</h1>
                    <a href="#/sell/inventory" class="btn btn-primary align-self-center" type="button"><i class="bi bi-plus-lg"></i> Add new mod listings</a>
                </div>
                <p>EVE Online servers cache this data and it is made available to us up to 60 minutes after requesting.</p>
                <p class="refresh-time">This text will update with the next refresh time.</p>
            </div>
        </div>
        <div class="inner-content">

            <div class="row mt-4">
                <div class="col placeholder-glow">
                    <span class="placeholder col-3"></span>
                    <span class="placeholder col-6"></span>
                    <span class="placeholder col-2"></span>
                </div>
            </div>
            <div class="row">
        `
  for (let i = 0; i < 8; i++) {
    html += `
                <div class="col-3 mt-4">
                    <div class="card" aria-hidden="true">
                        <svg class="bd-placeholder-img card-img-top" width="100%" height="180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder" preserveAspectRatio="xMidYMid slice" focusable="false">
                            <title>Placeholder</title>
                            <rect width="100%" height="100%" fill="#868e96"></rect>
                        </svg>
                        <div class="card-body">
                            <h5 class="card-title placeholder-glow">
                            <span class="placeholder col-6"></span>
                            </h5>
                            <p class="card-text placeholder-glow">
                            <span class="placeholder col-7"></span>
                            <span class="placeholder col-4"></span>
                            <span class="placeholder col-4"></span>
                            <span class="placeholder col-6"></span>
                            <span class="placeholder col-8"></span>
                            </p>
                            <a class="btn btn-secondary disabled placeholder col-6 float-end" aria-disabled="true"></a>
                        </div>
                    </div>
                </div>
    `
  }

  html += `
            </div>
            <div class="row mt-4">
                <div class="col placeholder-glow">
                    <span class="placeholder col-6"></span>
                    <span class="placeholder col-3"></span>
                    <span class="placeholder col-2"></span>
                </div>
            </div>
        </div>
    </div>
    `
  document.querySelector('.content').innerHTML = html
}

const renderSellerListing = (listedItems) => {
  let html = ''

  if (listedItems.length === 0) {
    html = `
        <div class="row mt-4">
            <div class="col">
                <div class="alert alert-info" role="alert">
                    <p class="m-0">No items listed - Please add some</p>
                </div>
            </div>
        </div>
        `
  } else {
    const filterHtml = `
    <div class="row mt-4">
        <div class="col">
            <div class="hstack gap-3">
                <input class="form-control me-auto" type="text" placeholder="TODO - Filter your items somehow">
                <button type="button" class="btn btn-secondary">Submit</button>
                <div class="vr"></div>
                <button type="button" class="btn btn-outline-danger">Reset</button>
            </div>
        </div>
    </div>
    `
    html += filterHtml
    html += '<div class="row">'
    for (const listedItem of listedItems) {
      html += `
        <div class="col-3 mt-4">
            ${renderInventoryCard(listedItem)}
        </div>`
    }
    html += '</div>'
  }
  document.querySelector('.inner-content').innerHTML = html
}

export const initSellFlow = async () => {
  if (doesCurrentCharacterHaveSellerScope()) {
    const userDetails = getCurrentUserDetails()
    renderSellerPlaceholder(userDetails)
    console.log('Seller logged in, show sell page')
    const listedItems = await getCurrentUserInventory()
    console.log('listedItems', listedItems)
    renderSellerListing(listedItems)
  } else {
    console.log('No seller scope')
    askForSellerScopePermission()
  }
}
