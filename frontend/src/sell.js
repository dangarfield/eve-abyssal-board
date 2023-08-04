import { doesCurrentCharacterHaveSellerScope, getCurrentUserDetails, triggerLoginFlow } from './auth'
import { getCurrentUserListedItems } from './board-api'
import { getCurrentUserModInventory } from './esi-api'

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
                    <a href="#/sell/inventory" class="btn btn-primary" type="button"><i class="bi bi-plus-lg"></i> Add new mod listing</a>
                </div>
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
            <div class="card" aria-hidden="true">
                <svg class="bd-placeholder-img card-img-top" width="100%" height="180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder" preserveAspectRatio="xMidYMid slice" focusable="false">
                    <title>Placeholder</title>
                    <rect width="100%" height="100%" fill="#868e96"></rect>
                </svg>
                <div class="card-body">
                    <h5 class="card-title">
                        TODO - ${listedItem.title}
                    </h5>
                </div>
            </div>
        </div>`
    }
    html += '</div>'
  }
  document.querySelector('.inner-content').innerHTML = html
}
const renderInventoryPlaceholder = (userDetails) => {
  let html = `
    <div class="container">
        <div class="row">
            <div class="col">
                <div class="d-grid gap-2 d-md-flex justify-content-between">
                    <h1>These mods are in your hanger</h1>
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
const formatForUnit = (value, unit, addSign) => {
  let outputValue = ''
  switch (unit) {
    case 'GJ': outputValue = value.toFixed(1); break
    case 's': outputValue = (value / 1000).toFixed(2); break
    case 'x': outputValue = value.toFixed(3); break
    case 'm': outputValue = Math.floor(value).toFixed(0); break
    // case '%': outputValue = (100 * (1 - value)).toFixed(2); break
    default: outputValue = value.toFixed(2); break
  }
  const signValue = addSign && value > 0 ? '+' : ''
  outputValue = outputValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${signValue}${outputValue} ${unit}`
}
const renderAvailableInventory = (availableInventory, cacheExpires, lastModified) => {
  let html = ''

  if (availableInventory.length === 0) {
    html = `
        <div class="row mt-4">
            <div class="col">
                <div class="alert alert-info" role="alert">
                    <p class="m-0">No abyss mods found in your hanger or cargo</p>
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
    for (const item of availableInventory) {
      const dogmaHtml = item.relevantDogmaAttributes.map(dogma => {
        return `<p><img src="icons/${dogma.iconID}.png" width="32" height="32">
            ${dogma.name} |
            ${formatForUnit(dogma.value, dogma.unit)} |
            ${formatForUnit(dogma.diff, dogma.unit, true)} |
            ${dogma.isGood ? 'GOOD' : 'BAD'} |
            ${formatForUnit(dogma.min, dogma.unit)} - ${formatForUnit(dogma.max, dogma.unit)}
            </p>`
      }).join('')
      html += `
        <div class="col-3 mt-4">
            <div class="card" aria-hidden="true">
                <div class="card-body">
                    <h5 class="card-title"><img src="https://images.evetech.net/types/${item.type_id}/icon?size=32">${item.typeName}</h5>
                    <hr/>
                    <p><img src="https://images.evetech.net/types/${item.mutatorTypeId}/icon?size=32">${item.mutatorTypeName}</p>
                    <p><img src="https://images.evetech.net/types/${item.sourceTypeId}/icon?size=32">${item.sourceTypeName}</p>
                    <hr/>
                    ${dogmaHtml}
                </div>
            </div>
        </div>`
    }
    html += '</div>'
  }
  document.querySelector('.inner-content').innerHTML = html

  const formatMilliseconds = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)

    const formattedSeconds = seconds % 60
    const formattedMinutes = minutes > 0 ? `${minutes}m ` : ''
    const formattedTime = formattedMinutes + `${formattedSeconds}s`
    return formattedTime
  }

  const refreshTime = () => {
    const ele = document.querySelector('.refresh-time')
    const timeDiff = cacheExpires - new Date()
    // console.log('timeDiff', timeDiff)
    if (ele === undefined) {
      clearInterval(refreshTimeInterval)
    } else if (timeDiff < 0) {
      ele.innerHTML = '<span class="text-primary">New Inventory data available on EVE API - Refresh the page to load it</span>'
      clearInterval(refreshTimeInterval)
    } else {
      ele.innerHTML = `Inventory data correct and cached by EVE API as of ${lastModified.toLocaleTimeString(undefined)}. Next update available in <span class="text-primary">${(formatMilliseconds(timeDiff))}</span>`
    }
  }
  const refreshTimeInterval = setInterval(refreshTime, 1000)
  refreshTime()
}
export const initSellFlow = async () => {
  if (doesCurrentCharacterHaveSellerScope()) {
    const userDetails = getCurrentUserDetails()
    renderSellerPlaceholder(userDetails)
    console.log('Seller logged in, show sell page')
    const listedItems = await getCurrentUserListedItems()
    console.log('listedItems', listedItems)
    renderSellerListing(listedItems)
  } else {
    console.log('No seller scope')
    askForSellerScopePermission()
  }
}

export const initListModInventory = async () => {
  if (doesCurrentCharacterHaveSellerScope()) {
    const userDetails = getCurrentUserDetails()
    renderInventoryPlaceholder(userDetails)
    console.log('Seller logged in, show available mods')
    const { inventory, cacheExpires, lastModified } = await getCurrentUserModInventory()
    renderAvailableInventory(inventory, cacheExpires, lastModified)
  } else {
    window.location.hash = '#/sell'
  }
}
