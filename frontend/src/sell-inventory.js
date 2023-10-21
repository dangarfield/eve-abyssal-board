import { doesCurrentCharacterHaveSellerScope, getCurrentUserDetails } from './auth'
import { getAppConfig, getAppraisalsForItemIDs, initiateListingFlow } from './board-api'
import { getCurrentUserModInventory, sendLoadingStatusEvent } from './esi-api'
import { listingPriceStringToInt, formatToISKString, triggerRefreshTime, showModalAlert, deepCopy, loadData, saveData, clearData, closeCurrentModal } from './utils'
import { renderInventoryCard } from './component/inventory-card'

const renderInventoryPlaceholder = (userDetails, appConfig) => {
  let html = `
<div class="container">
  <div class="row">
    <div class="col-lg-12 my-5 pagetitle">
      <h2>Mods are in your hangers - Available to be listed</h2>
    </div>
  </div>
  <div class="row mb-4">
    <div class="col-lg-8">
      <div class="card h-100">
        <div class="card-body">
          <h5 class="card-title">Find your assets</h5>
          <p class="card-text">EVE Online servers cache this data and it is made available to us up to 60 minutes after requesting.</p>
          <p class="card-text">Select the mods that you wish to sell and add your listing price. You can update the listing price at any time after it is listed.</p>
          <p class="card-text">There is a simplistic filter to hide auto-defined bricked mods. This is subjective and will be improved over time. Let us know how it works for you.</p>
          <p class="card-text">To speed up the page, we cache the appraisals in your browser. If you want to refresh them, <a href="" class="refresh-appraisal-cache">click here</a>.</p>
          <!--
          <p class="card-text">Mods ${formatToISKString(appConfig.listingFeeThreshold)} and over - Listing price is ${formatToISKString(appConfig.listingFeeCap)}</p>
          <p class="card-text">Mods under ${formatToISKString(appConfig.listingFeeThreshold)} - FREE!</p>
          <p class="card-text">Amendent fees apply to mods over ${formatToISKString(appConfig.listingFeeThreshold)}.</p>
          <p class="card-text"><i><b>Note:</b> Once you send a listing fee payment and you cancel after the mod is on sale or sell the item elsewhere, the listing fee will not be returned.</i></p>
          -->
        </div>
      </div>
    </div>
    <div class="col-lg-4">
      <div class="card h-100 text-bg-info-subtle">
        <div class="card-body text-center">
          <div class="pt-3">
            <i class="bi bi-info-circle fs-1 text-info card-title"></i>
          </div>
          <h5 class="card-title">Next inventory refresh time</h5>
          <p class="card-text refresh-time-inventory">This text will update with the next refresh time.</p>
        </div>
      </div>
    </div>
  </div>

  <div class="inner-content">
    <div class="row mt-4">
      <div class="col placeholder-glow">
        <span class="placeholder col-lg-3"></span>
        <span class="placeholder col-lg-6"></span>
        <span class="placeholder col-lg-2"></span>
      </div>
    </div>
    <div class="row">`
  for (let i = 0; i < 8; i++) {
    html += `
      <div class="col-lg-3 mt-4">
        <div class="card" aria-hidden="true">
          <svg class="bd-placeholder-img card-img-top" width="100%" height="180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder" preserveAspectRatio="xMidYMid slice" focusable="false">
            <title>Placeholder</title>
            <rect width="100%" height="100%" fill="#868e96"></rect>
          </svg>
          <div class="card-body">
            <h5 class="card-title placeholder-glow">
              <span class="placeholder col-lg-6"></span>
            </h5>
            <p class="card-text placeholder-glow">
              <span class="placeholder col-lg-7"></span>
              <span class="placeholder col-lg-4"></span>
              <span class="placeholder col-lg-4"></span>
              <span class="placeholder col-lg-6"></span>
              <span class="placeholder col-lg-8"></span>
            </p>
            <a class="btn btn-secondary disabled placeholder col-lg-6 float-end" aria-disabled="true"></a>
          </div>
        </div>
      </div>`
  }

  html += `
    </div>
    <div class="row mt-4">
      <div class="col placeholder-glow">
        <span class="placeholder col-lg-6"></span>
        <span class="placeholder col-lg-3"></span>
        <span class="placeholder col-lg-2"></span>
      </div>
    </div>
  </div>
</div>
<div class="selected-inventory-holder">
  <nav class="fixed-bottom bg-secondary-subtle pb-0 pt-2">
    <div class="container-fluid">
      <div class="row">
        <div class="col-lg-10">
          <ul class="row my-0 px-0 gx-2 selected-inventory-item-holder"></ul>
        </div>
        <div class="col-lg-2">
          <ul class="navbar-nav ms-auto h-100 pb-2">
            <button class="btn btn-primary w-100 h-100 confirm-inventory" type="submit">
              <div class="d-flex flex-row justify-content-center">
                <i class="bi bi-plus-circle-fill"></i>
                <span class="text-start ps-3">
                  List <span class="count">0 mods</span><br/>
                  <i class="price">0 ISK</i>
                </span>
              </div>
            </button>
          </ul>
        </div>
      </div>
    </div>
  </nav>
</div>`
  document.querySelector('.content').innerHTML = html
}
const renderAvailableInventory = (availableInventory, cacheExpires, lastModified, sortKey) => {
  let html = ''

  if (availableInventory.length === 0) {
    html = `
          <div class="row mt-4">
              <div class="col-lg-12">
                  <div class="alert alert-info" role="alert">
                      <p class="m-0">No abyss mods found in your hanger or cargo</p>
                  </div>
              </div>
          </div>
          `
  } else {
    html += `
    <div class="row row-cols-lg-auto g-3 align-items-center flex-row-reverse px-2">
      <div class="col-12">
        <input class="form-control ms-2 data-search" type="search" placeholder="Search inventory">
      </div>
      <div class="col-12">
        <select class="form-select form-sort">
          <option value="alpha"${sortKey === 'alpha' ? ' selected' : ''}>Sort by: A-Z</option>
          <option value="appraisal"${sortKey === 'appraisal' ? ' selected' : ''}>Sort by: Appraisal Value</option>
          <option value="quality"${sortKey === 'quality' ? ' selected' : ''}>Sort by: Quality Rating</option>
        </select>
      </div>
      <div class="col-12">
        <div class="form-check form-switch">
          <input class="form-check-input toggle-show-bricked" type="checkbox" role="switch" id="toggle-show-bricked" checked>
          <label class="form-check-label" for="toggle-show-bricked" title="Note: This may be incorrect, we will improve this over time.">Show bricked</label>
        </div>
      </div>
      <div class="col-12">
        <div class="form-check form-switch">
          <input class="form-check-input toggle-show-all" type="checkbox" role="switch" id="toggle-show-all">
          <label class="form-check-label" for="toggle-show-all">Show already listed</label>
        </div>
      </div>
      <div class="col-12">
        <div class="form-check form-switch">
          <input class="form-check-input toggle-select-all" type="checkbox" role="switch" id="toggle-select-all">
          <label class="form-check-label" for="toggle-select-all">Select / deselect all</label>
        </div>
      </div>
    </div>
`
    html += `
    <div class="row inventory-row">  
      <div class="col-lg-12 mt-4 inventory-filtered">
        <div class="card text-bg-info-subtle">
          <div class="card-body text-center">
            <div class="pt-3">
              <i class="bi bi-info-circle fs-1 text-info card-title"></i>
            </div>
            <h5 class="card-title">Some listed mods are hidden - Use <code>Show already listed</code> to see all items</h5>
          </div>
        </div>
      </div>
      <div class="col-lg-12 mt-4 inventory-pagination">
      </div>
    </div>
      `
    html += '<div class="row inventory-list"></div>'
    html += `
    <div class="row">
      <div class="col-lg-12 inventory-pagination">
      </div>
    </div>
    </div>`
  }
  document.querySelector('.inner-content').innerHTML = html
  for (const item of availableInventory) {
    item.typeNameLower = item.typeName.toLowerCase()
  }
}
const pagination = {
  activePage: 1,
  itemsPerPage: 4 * 25,
  pages: 1
}
const filterCardsAndRender = (availableInventory) => {
  const searchQuery = document.querySelector('.data-search').value.toLowerCase()
  const hideListed = !document.querySelector('.toggle-show-all').checked
  const hideBricked = !document.querySelector('.toggle-show-bricked').checked
  let allItemsHidden = true
  // console.log('filterCardsAndRender', availableInventory, availableInventory.map(i => i.typeName))
  for (const item of availableInventory) {
    const isListed = item.status !== 'NONE'
    const isBricked = Math.round(item.qualityScore) < 15
    // Filter based on search query and hide/show based on hideListed
    // console.log('searchQuery', item.typeName, searchQuery, item.typeNameLower.includes(searchQuery))
    const shouldHide = (searchQuery && !item.typeNameLower.includes(searchQuery)) || (hideListed && isListed) || (hideBricked && isBricked)
    item.shouldShow = !shouldHide
    if (!shouldHide) allItemsHidden = false
  }
  const showList = availableInventory.filter(i => i.shouldShow)
  pagination.pages = Math.ceil(showList.length / pagination.itemsPerPage)
  if (pagination.activePage > pagination.pages) pagination.activePage = 1
  const skip = (pagination.activePage - 1) * pagination.itemsPerPage
  const limit = pagination.itemsPerPage
  const displayList = showList.slice(skip, skip + limit)

  const listHtml = displayList.map(item => `
      <div class="col-lg-3 mt-4">
      ${renderInventoryCard(item, true)}
      </div>`).join('')
  document.querySelector('.inventory-list').innerHTML = listHtml
  bindInventoryCardActions(availableInventory)

  document.querySelector('.inventory-filtered').style.display = allItemsHidden ? 'block' : 'none'

  for (const paginationEle of [...document.querySelectorAll('.inventory-pagination')]) {
    if (pagination.pages === 1) {
      paginationEle.style.display = 'none'
      continue
    } else {
      paginationEle.style.display = 'block'
    }
    const items = Array.from({ length: pagination.pages }, (_, i) => i + 1).map(i => i === pagination.activePage
      ? `<li class="page-item active"><span class="page-link">${i}</span></li>`
      : `<li class="page-item"><button class="page-link">${i}</button></li>`).join('')

    paginationEle.innerHTML = `
    <nav>
      <ul class="pagination pagination-sm flex-wrap">
        ${items}
      </ul>
    </nav>
    `
    for (const pageLinkEle of [...document.querySelectorAll('.inventory-pagination button.page-link')]) {
      pageLinkEle.addEventListener('click', () => {
        const newPage = parseInt(pageLinkEle.textContent)
        console.log('pageLinkEle', newPage)
        pagination.activePage = newPage
        filterCardsAndRender(availableInventory)
      })
    }
  }
}
const updateTotalListingPrice = async () => {
  const appConfig = await getAppConfig()
  if (document.querySelectorAll('.inventory-item.selected .listing-price').length > 0) {
    const totalListingFee = Array.from(document.querySelectorAll('.inventory-item.selected .listing-price')).reduce((sum, element) => {
      let listingPrice = listingPriceStringToInt(element.value || '0')
      if (listingPrice < appConfig.listingFeeThreshold) {
        listingPrice = 0
      } else {
        listingPrice = appConfig.listingPercentage * listingPrice
      }
      if (listingPrice >= appConfig.listingFeeCap) {
        listingPrice = appConfig.listingFeeCap
      }
      console.log('listingPrice', listingPrice, appConfig.listingFeeCap)

      return sum + listingPrice
    }, 0)
    console.log('totalListingFee', totalListingFee)
    // const totalListingFee = appConfig.listingPercentage * totalListingPrice
    document.querySelector('.confirm-inventory .price').innerHTML = `<span class="badge text-bg-secondary">${formatToISKString(totalListingFee)}</span>`
  }
}
const bindInventoryCardActions = (availableInventory) => {
// Bind add and remove inventory
  for (const inventoryItemEle of [...document.querySelectorAll('.inventory-item')]) {
    inventoryItemEle.addEventListener('click', async function (event) {
      if (event.target.classList.contains('no-click-close')) return
      const itemID = parseInt(inventoryItemEle.getAttribute('data-item-id'))
      const item = availableInventory.find(i => i.itemID === itemID)
      // console.log('inventoryItemEle', inventoryItemEle, itemID, availableInventory, item)
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
        const selectedItemEle = document.querySelector(`.selected-inventory-item-holder [data-item-id="${itemID}"]`)
        selectedItemEle.remove()
        inventoryItemEle.querySelector('.listing-price-holder').style.display = 'none'
        inventoryItemEle.querySelector('.listing-price-holder .listing-price').focus()
      } else {
        console.log('Item not selected, add to list')
        inventoryItemEle.classList.add('selected')
        inventoryItemEle.querySelector('.interaction-button').innerHTML = '<button class="btn btn-danger btn-sm"><i class="bi bi-x-circle-fill"></i></button>'

        let html = ''
        html += `
            <div class="col-lg-2" data-item-id="${itemID}">
              <span class="selected-inventory-item position-relative">
                <button class="btn btn-success btn-sm w-100 mb-2" type="submit">
                  <img src="https://images.evetech.net/types/${item.typeID}/icon?size=32">
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
            document.querySelector(`.inventory-item[data-item-id="${itemID}"]`).click()
          })
        }
      }
      const selectedCount = document.querySelectorAll('.inventory-item.selected').length
      console.log('selectedCount', selectedCount)

      document.querySelector('.confirm-inventory .count').innerHTML = `${selectedCount} mod${selectedCount === 1 ? '' : 's'}`
      await updateTotalListingPrice()

      const selectedInventoryHolderEle = document.querySelector('.selected-inventory-holder')
      const backToTopEle = document.querySelector('.back-to-top')
      if (selectedCount > 0) {
        selectedInventoryHolderEle.style.opacity = '1'
        backToTopEle.classList.add('higher')
      } else {
        selectedInventoryHolderEle.style.opacity = '0'
        backToTopEle.classList.remove('higher')
      }
    })
  }
  for (const listingPriceEle of [...document.querySelectorAll('.listing-price')]) {
    listingPriceEle.addEventListener('blur', async () => {
      listingPriceEle.value = await validateListingPrice(listingPriceEle.value)
    })
  }
}
const bindInventoryActions = (availableInventory, cacheExpires, lastModified) => {
  triggerRefreshTime('.refresh-time-inventory', 'Inventory data', cacheExpires, lastModified)

  document.querySelector('.toggle-show-bricked').addEventListener('click', function () {
    filterCardsAndRender(availableInventory)
  })
  document.querySelector('.toggle-show-all').addEventListener('click', function () {
    filterCardsAndRender(availableInventory)
  })
  document.querySelector('.data-search').addEventListener('input', function () {
    filterCardsAndRender(availableInventory)
  })

  document.querySelector('.toggle-select-all').addEventListener('change', function () {
    const selectAll = this.checked
    document.querySelectorAll('.inventory-item').forEach(element => {
      if (element.parentElement.style.display === 'none') return
      const isListed = element.classList.contains('listed')
      const isSelected = element.classList.contains('selected')
      // console.log('e', element, isListed, '-', selectAll, isSelected)
      if (isListed) return
      if (selectAll && !isSelected) element.click()
      if (!selectAll && isSelected) element.click()
    })
  })
  filterCardsAndRender(availableInventory)

  document.querySelector('.confirm-inventory').addEventListener('click', async () => {
    const selectedInventoryToList = [...document.querySelectorAll('.inventory-item.selected[data-item-id]')].map(a => {
      const inventory = availableInventory.find(i => i.itemID === parseInt(a.getAttribute('data-item-id')))

      const data = deepCopy(inventory.data)
      // data.listingPriceString = a.querySelector('.listing-price').value
      data.listingPrice = listingPriceStringToInt(a.querySelector('.listing-price').value)
      data.appraisal = inventory.appraisal
      // TODO - Appraisal value seems to have floating point issues
      return data
    })

    for (const item of selectedInventoryToList) {
      if (item.listingPrice === 0) {
        // document.querySelector(`.inventory-item[data-item-id="${item.itemID}"] .listing-price`).scrollIntoView()

        // document.querySelector(`.inventory-item[data-item-id="${item.itemID}"] .listing-price`).focus()
        document.querySelector(`.inventory-item[data-item-id="${item.itemID}"] .listing-price`).scrollIntoView({ behavior: 'instant' }) // Use 'instant' for immediate scroll
        document.querySelector(`.inventory-item[data-item-id="${item.itemID}"] .listing-price`).focus()

        console.log('FOCUS END') // TODO The above SHOULD be instant, but it's not for some reason
        setTimeout(() => {
          showModalAlert('Error', '<p>Please ensure the listing prices are above zero</p>')
        }, 1000)

        return
      }
    }
    console.log('selectedInventoryToList', selectedInventoryToList)
    document.querySelector('.confirm-inventory').setAttribute('disabled', 'disabled')

    const paymentDetails = await initiateListingFlow(selectedInventoryToList)
    console.log('paymentDetails', paymentDetails)
    if (paymentDetails.amount > 0) {
      await showModalAlert('Listing Payment Details', `
        <p class="mb-3">You will receive an ingame mail containing the payment information. It will also be available on your <a href="/sell">seller</a> page<p>
        <p class="mb-3">In game, search for and right click on the <code>${paymentDetails.corpName}</code> corporation, then click 'Give Money'. Fill in the details as follows</p>

        <div class="alert alert-info fade show col-lg-8 offset-lg-2" role="alert">
          <p class="mb-0 d-flex justify-content-between"><b>Amount:</b> <code>${paymentDetails.amount}</code></p>
          <p class="mb-0 d-flex justify-content-between"><b>Reason:</b> <code>${paymentDetails.reason}</code></p>
        </div>

        <p>Please be careful to fill this information in carefully.</p>
        <p>It may take up to 1 hour for the transation to be registered and your items listed.</p>
        `)
    }
    window.location.assign('/sell')
  })
}
// const runBatches = async (promises, batchSize) => {
//   for (let i = 0; i < promises.length; i += batchSize) {
//     const batch = promises.slice(i, i + batchSize)
//     // console.log('runBatches START', i)
//     await Promise.all(batch.map(promiseFn => promiseFn(i / batchSize)))
//     // console.log('runBatches END', i)
//   }
// }

const processItemIDsInBatches = async (itemIDs) => {
  const batchSize = 100
  const appraisals = {}
  sendLoadingStatusEvent('appraisal', `Fetching ${itemIDs.length} appraisals`)
  for (let i = 0; i < itemIDs.length; i += batchSize) {
    const batchOfItemIDs = itemIDs.slice(i, i + batchSize)

    const batchedAppraisalsGroup = await getAppraisalsForItemIDs(batchOfItemIDs)
    for (const appraisalID in batchedAppraisalsGroup) {
      appraisals[appraisalID] = batchedAppraisalsGroup[appraisalID]
    }
    sendLoadingStatusEvent('appraisal', `Fetched ${Math.min(i + batchSize, itemIDs.length)} of ${itemIDs.length} appraisals`)
  }
  sendLoadingStatusEvent('appraisal', `Fetched all ${itemIDs.length} appraisals - COMPLETE`)
  return appraisals
}
const fetchAndAddAppraisalData = async (inventory) => {
  const cachedAppraisals = loadData().appraisals || {} // TEMP commented out
  // const cachedAppraisals = {}
  // console.log('fetchAndAddAppraisalData', cachedAppraisals)
  const itemIDsForAppraisal = []
  for (const item of inventory) {
    if (cachedAppraisals[item.itemID]) {
      item.appraisal = [cachedAppraisals[item.itemID]]
    } else {
      itemIDsForAppraisal.push(item.itemID)
    }
  }
  const appraisals = await processItemIDsInBatches(itemIDsForAppraisal)
  // console.log('appraisals', appraisals)
  for (const itemIDString in appraisals) {
    const itemID = parseInt(itemIDString)
    const appraisal = appraisals[itemIDString]
    // console.log('appraisalHolder', itemID, appraisal)
    inventory.find(i => i.itemID === itemID).appraisal = [appraisal]

    for (const i of inventory.filter(i => i.itemID === itemID)) { // TEMP for testing because inventory is duplicated
      i.appraisal = [appraisal]
    }

    cachedAppraisals[itemIDString] = appraisal
  }
  // console.log('cachedAppraisals', cachedAppraisals)
  // console.log('non appraised', inventory.filter())
  saveData('appraisals', cachedAppraisals)
}
export const validateListingPrice = async (inputValue) => {
  const digitsString = inputValue.match(/[\d.]+/g)
  const value = parseFloat(digitsString ? digitsString.join('') : '')
  // console.log('validateListingPrice', inputValue, value)
  if (isNaN(value)) return 0
  await updateTotalListingPrice()
  const inputValueLower = inputValue.toLowerCase().replace('isk', '')
  let unit = ''
  if (inputValueLower.includes('k') || inputValueLower.includes('thou')) unit = 'k'
  else if (inputValueLower.includes('m') || inputValueLower.includes('mil')) unit = 'm'
  else if (inputValueLower.includes('b') || inputValueLower.includes('bil')) unit = 'b'
  else if (inputValueLower.includes('t') || inputValueLower.includes('tril')) unit = 't'
  return value + unit
}
const sortInventory = (inventory) => {
  const sortKey = loadData().sellInventorySort || 'appraisal'
  // console.log('sellInventorySort', sortKey)
  switch (sortKey) {
    case 'quality':
      inventory.sort((a, b) => b.qualityScore - a.qualityScore || b.appraisal[0].price - a.appraisal[0].price)
      break
    case 'appraisal':
      inventory.sort((a, b) => b.appraisal[0].price - a.appraisal[0].price || b.qualityScore - a.qualityScore)
      break
    case 'alpha': default:
      inventory.sort((a, b) => a.typeName.localeCompare(b.typeName) || b.qualityScore - a.qualityScore)
      break
  }

  // inventory.sort((a, b) => a.typeName.localeCompare(b.typeName) || b.qualityScore - a.qualityScore)
  return sortKey
}
const bindSortSelection = () => {
  document.querySelector('.form-sort').addEventListener('change', (event) => {
    console.log('bindSortSelection change', event.target.value)
    saveData('sellInventorySort', event.target.value)
    window.location.reload()
  })
}
const bindAppraisalCacheRefresh = () => {
  document.querySelector('.refresh-appraisal-cache').addEventListener('click', (event) => {
    event.preventDefault()
    clearData('appraisals')
    window.location.reload()
  })
}
let statusAssetsEle
let statusDogmaEle
let statusSellerEle
let statusAppraisalEle
let statusRenderEle

const handleLoadingStatusEvent = (event) => {
  // Do something with the event data
  console.log('LoadingStatus Event received:', event.detail)
  switch (event.detail.type) {
    case 'assets':statusAssetsEle.innerHTML = event.detail.msg; break
    case 'dogma':statusDogmaEle.innerHTML = event.detail.msg; break
    case 'seller':statusSellerEle.innerHTML = event.detail.msg; break
    case 'appraisal':statusAppraisalEle.innerHTML = event.detail.msg; break
    case 'render':statusRenderEle.innerHTML = event.detail.msg; break
  }
}

export const initListModInventory = async () => {
  if (doesCurrentCharacterHaveSellerScope()) {
    const userDetails = getCurrentUserDetails()
    const appConfig = await getAppConfig()
    showModalAlert('Loading inventory',
    `<table class="table">
      <tbody>
        <tr><td>Loading inventory</td> <td class="status-assets">...</td></tr>
        <tr><td>Loading mod attributes</td> <td class="status-dogma">...</td></tr>
        <tr><td>Loading listed mods</td> <td class="status-seller">...</td></tr>
        <tr><td>Loading appraisals</td> <td class="status-appraisal">...</td></tr>
        <tr><td>Displaying mods</td> <td class="status-render">...</td></tr>
      </tbody>
    </table>`)
    statusAssetsEle = document.querySelector('.modal .status-assets')
    statusDogmaEle = document.querySelector('.modal .status-dogma')
    statusSellerEle = document.querySelector('.modal .status-seller')
    statusAppraisalEle = document.querySelector('.modal .status-appraisal')
    statusRenderEle = document.querySelector('.modal .status-render')
    renderInventoryPlaceholder(userDetails, appConfig)
    document.addEventListener('loadingStatusEvent', handleLoadingStatusEvent)
    console.log('Seller logged in, show available mods')
    const { inventory, cacheExpires, lastModified } = await getCurrentUserModInventory()
    await fetchAndAddAppraisalData(inventory)

    const sortKey = sortInventory(inventory)
    sendLoadingStatusEvent('render', 'Displaying mods on the page')
    renderAvailableInventory(inventory, cacheExpires, lastModified, sortKey)
    if (inventory.length > 0) {
      bindInventoryActions(inventory, cacheExpires, lastModified)
    }
    bindAppraisalCacheRefresh()
    bindSortSelection()
    sendLoadingStatusEvent('render', 'Displaying mods on the page - COMPLETE')
    closeCurrentModal()
  } else {
    window.location.assign('/sell')
  }
}
