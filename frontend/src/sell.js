import { getAppraisalForItemId } from './appraisal'
import { doesCurrentCharacterHaveSellerScope, getCurrentUserDetails, triggerLoginFlow } from './auth'
import { getAppConfig, getCurrentUserListedItems } from './board-api'
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
                <p>Select the mods that you wish to sell and add your listing price. You can update the listing price at any time after it is listed.</p>
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
    <div class="selected-inventory-holder">
      <nav class="fixed-bottom bg-secondary pb-0 pt-2">
        <div class="container-fluid">
          <div class="row">
            <div class="col-10">
              <ul class="row my-0 px-0 gx-2 selected-inventory-item-holder">
              </ul>
            </div>
            <div class="col-2">
              <ul class="navbar-nav ms-auto h-100 pb-2">
                <button class="btn btn-primary w-100 h-100 confirm-inventory" type="submit">
                  <div class="d-flex flex-row justify-content-center">
                    <i class="bi bi-plus-circle-fill"></i>
                    <span class="text-start ps-3">
                      List <span class="count">0</span> mods<br/>
                      <i class="price">0 ISK</i>
                    </span>
                  </div>
                </button>
              </ul>
            </div>
          </div>
          
        </div>
      </nav>

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
const formatToISKString = (number) => {
  const suffixes = ['', 'k', 'm', 'b', 't']
  let absNumber = Math.abs(number)
  let suffixIndex = 0
  while (absNumber >= 1000 && suffixIndex < suffixes.length - 1) {
    absNumber /= 1000
    suffixIndex++
  }
  const formattedNumber = Number.isInteger(absNumber) ? absNumber : absNumber.toFixed(1)
  const suffix = suffixes[suffixIndex]
  return number >= 0 ? formattedNumber + suffix + ' ISK' : '-' + formattedNumber + suffix + ' ISK'
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
    // const filterHtml = `
    // <div class="row mt-4">
    //     <div class="col">
    //         <div class="hstack gap-3">
    //             <input class="form-control me-auto" type="text" placeholder="TODO - Filter your items somehow">
    //             <button type="button" class="btn btn-secondary">Submit</button>
    //             <div class="vr"></div>
    //             <button type="button" class="btn btn-outline-danger">Reset</button>
    //         </div>
    //     </div>
    // </div>
    // `
    // html += filterHtml
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
          <div class="card-container inventory-item" data-item-id="${item.item_id}">
            <div class="card ">
                <div class="card-body">
                    <h5 class="card-title"><img src="https://images.evetech.net/types/${item.type_id}/icon?size=32">${item.typeName}</h5>
                    <hr/>
                    <p><img src="https://images.evetech.net/types/${item.mutatorTypeId}/icon?size=32">${item.mutatorTypeName}</p>
                    <p><img src="https://images.evetech.net/types/${item.sourceTypeId}/icon?size=32">${item.sourceTypeName}</p>
                    <hr/>
                    ${dogmaHtml}
                    <div class="appraisal" data-item-id="${item.item_id}">
                      <div class="col placeholder-glow">
                          <span class="col-3">Value:</span>
                          <span class="placeholder col-6"></span>
                          <span class="placeholder col-2"></span>
                      </div>
                    </div>
                    <div class="mt-2 listing-price-holder" style="display:none;">
                      <div class="input-group mb-3">
                        <input type="text" class="form-control listing-price no-click-close text-end" placeholder="Add listing price">
                        <span class="input-group-text no-click-close">eg, 13m 1.9b</span>
                      </div>

                    </div>
                </div>
            </div>
            <span class="interaction-button">
              <button class="btn btn-primary btn-sm">
                <i class="bi bi-plus-circle-fill"></i>
              </button>
            </span>
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

  // Bind add and remove inventory
  for (const inventoryItemEle of [...document.querySelectorAll('.inventory-item')]) {
    inventoryItemEle.addEventListener('click', async function (event) {
      if (event.target.classList.contains('no-click-close')) return
      const itemId = parseInt(inventoryItemEle.getAttribute('data-item-id'))
      const item = availableInventory.find(i => i.item_id === itemId)
      console.log('inventoryItemEle', inventoryItemEle, itemId, item)
      const isListed = inventoryItemEle.classList.contains('listed')
      if (isListed) {
        console.log('Item already listed')
        return
      }
      const isSelected = inventoryItemEle.classList.contains('selected')
      if (isSelected) {
        console.log('Item already selected, remove from list')
        inventoryItemEle.classList.remove('selected')
        inventoryItemEle.querySelector('.interaction-button').innerHTML = '<button class="btn btn-primary btn-sm"><i class="bi bi-plus-circle-fill"></i></button>'
        const selectedItemEle = document.querySelector(`.selected-inventory-item-holder [data-item-id="${itemId}"]`)
        selectedItemEle.remove()
        inventoryItemEle.querySelector('.listing-price-holder').style.display = 'none'
        inventoryItemEle.querySelector('.listing-price-holder .listing-price').focus()
      } else {
        console.log('Item not selected, add to list')
        inventoryItemEle.classList.add('selected')
        inventoryItemEle.querySelector('.interaction-button').innerHTML = '<button class="btn btn-danger btn-sm"><i class="bi bi-x-circle-fill"></i></button>'

        let html = ''
        html += `
        <div class="col-2" data-item-id="${itemId}">
          <span class="selected-inventory-item">
            <button class="btn btn-success btn-sm w-100 mb-2" type="submit">
              <img src="https://images.evetech.net/types/${item.type_id}/icon?size=32">
              <span class="title">${item.typeName}</span>
            </button>
            <span class="interaction-button">
              <button class="btn btn-danger btn-sm">
                <i class="bi bi-x-circle-fill"></i>
              </button>
            </span>
          </span>
        </div>`
        document.querySelector('.selected-inventory-item-holder').insertAdjacentHTML('beforeend', html)
        inventoryItemEle.querySelector('.listing-price-holder').style.display = 'block'

        const selectedInventoryItems = document.querySelectorAll('.selected-inventory-item-holder [data-item-id]')
        if (selectedInventoryItems.length > 0) {
          const lastSelectedInventoryItem = selectedInventoryItems[selectedInventoryItems.length - 1]
          lastSelectedInventoryItem.addEventListener('click', () => {
            document.querySelector(`.inventory-item[data-item-id="${itemId}"]`).click()
          })
        }
      }
      const selectedCount = document.querySelectorAll('.inventory-item.selected').length
      const listingPrice = (await getAppConfig()).listingPrice * selectedCount
      console.log('listingPrice', selectedCount, listingPrice)
      document.querySelector('.confirm-inventory .count').textContent = selectedCount
      document.querySelector('.confirm-inventory .price').textContent = formatToISKString(listingPrice)

      const selectedInventoryHolderEle = document.querySelector('.selected-inventory-holder')
      if (selectedCount > 0) {
        selectedInventoryHolderEle.style.opacity = '1'
      } else {
        selectedInventoryHolderEle.style.opacity = '0'
      }
    })
  }
  for (const listingPriceEle of [...document.querySelectorAll('.listing-price')]) {
    listingPriceEle.addEventListener('blur', () => {
      listingPriceEle.value = validateListingPrice(listingPriceEle.value)
    })
  }
  document.querySelector('.confirm-inventory').addEventListener('click', () => {
    const selectedInventoryToList = [...document.querySelectorAll('.inventory-item.selected[data-item-id]')].map(a => {
      const inventory = availableInventory.find(i => i.item_id === parseInt(a.getAttribute('data-item-id')))
      inventory.listingPrice = a.querySelector('.listing-price').value
      return inventory
    })
    console.log('selectedInventoryToList', selectedInventoryToList)
    window.alert(`Selected Inventory To List: ${selectedInventoryToList.map(a => a.typeName + ' ' + a.listingPrice).join(', ')}`)
  })
}
const validateListingPrice = (inputValue) => {
  const digitsString = inputValue.match(/[\d.]+/g)
  const value = parseFloat(digitsString ? digitsString.join('') : '')

  const inputValueLower = inputValue.toLowerCase().replace('isk', '')
  let unit = ''
  if (inputValueLower.includes('k') || inputValueLower.includes('thou')) unit = 'k'
  else if (inputValueLower.includes('m') || inputValueLower.includes('mil')) unit = 'm'
  else if (inputValueLower.includes('b') || inputValueLower.includes('bil')) unit = 'b'
  else if (inputValueLower.includes('t') || inputValueLower.includes('tril')) unit = 't'
  return value + unit
}
const updateAppraisals = async () => {
  // console.log('start')
  await Promise.all([...document.querySelectorAll('.appraisal')].map(async appraisalEle => {
    const itemId = appraisalEle.getAttribute('data-item-id')
    const appraisal = await getAppraisalForItemId(itemId)
    // console.log('appraisalEle', appraisalEle, itemId, appraisal)
    appraisalEle.innerHTML = `<p>Value: ${appraisal.value} <i>(Confidence: ${appraisal.confidence})</></p>`
    appraisalEle.parentNode.querySelector('.listing-price').value = validateListingPrice(appraisal.value)
    return appraisalEle
  }))
  // console.log('end')
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
    await updateAppraisals()
  } else {
    window.location.hash = '#/sell'
  }
}
