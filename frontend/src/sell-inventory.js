import { doesCurrentCharacterHaveSellerScope, getCurrentUserDetails } from './auth'
import { getAppConfig, initiateListingFlow } from './board-api'
import { getCurrentUserModInventory } from './esi-api'
import { listingPriceStringToInt, formatToISKString, triggerRefreshTime, showModalAlert, deepCopy } from './utils'
import { getAppraisalForItem } from './appraisal'
import { renderInventoryCard } from './component/inventory-card'

const renderInventoryPlaceholder = (userDetails) => {
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
          <p class="card-text"><i><b>Note:</b> Once you send a listing fee payment and you cancel after the mod is on sale or sell the item elsewhere, the listing fee will not be returned.</i></p>
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
</div>`
  document.querySelector('.content').innerHTML = html
}
const renderAvailableInventory = (availableInventory, cacheExpires, lastModified) => {
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
    html += `<div class="row inventory-row">
      
      <div class="col-lg-12 mt-4 inventory-filtered">
        <div class="card text-bg-info-subtle">
          <div class="card-body text-center">
            <div class="pt-3">
              <i class="bi bi-info-circle fs-1 text-info card-title"></i>
            </div>
            <h5 class="card-title">Some listed mods are hidden - Use <code>Show already listed</code> to see all item</h5>
          </div>
        </div>
      </div>`
    for (const item of availableInventory) {
      html += '<div class="col-lg-3 mt-4">'
      html += renderInventoryCard(item)
      html += '</div>'
    }
    html += '</div>'
  }
  document.querySelector('.inner-content').innerHTML = html
}

const filterCards = () => {
  const searchQuery = document.querySelector('.data-search').value.toLowerCase()
  const hideListed = !document.querySelector('.toggle-show-all').checked
  let allItemsHidden = true
  document.querySelectorAll('.inventory-item').forEach((element) => {
    const text = element.querySelector('.type-name').textContent.toLowerCase()
    const isListed = element.classList.contains('listed')

    // Filter based on search query and hide/show based on hideListed
    const shouldHide = (searchQuery && !text.includes(searchQuery)) || (hideListed && isListed)
    // element.style.display = shouldHide ? 'none' : 'block'
    element.parentElement.style.display = shouldHide ? 'none' : 'block'
    if (!shouldHide) allItemsHidden = false
  })

  document.querySelector('.inventory-filtered').style.display = allItemsHidden ? 'block' : 'none'
}
const bindInventoryActions = (availableInventory, cacheExpires, lastModified) => {
  triggerRefreshTime('.refresh-time-inventory', 'Inventory data', cacheExpires, lastModified)

  document.querySelector('.toggle-show-all').addEventListener('click', function () {
    filterCards()
  })
  document.querySelector('.data-search').addEventListener('input', function () {
    filterCards()
  })
  filterCards()
  document.querySelector('.toggle-select-all').addEventListener('change', function () {
    const selectAll = this.checked
    document.querySelectorAll('.inventory-item').forEach(element => {
      const isListed = element.classList.contains('listed')
      const isSelected = element.classList.contains('selected')
      // console.log('e', element, isListed, '-', selectAll, isSelected)
      if (isListed) return
      if (selectAll && !isSelected) element.click()
      if (!selectAll && isSelected) element.click()
    })
  })
  // Bind add and remove inventory
  for (const inventoryItemEle of [...document.querySelectorAll('.inventory-item')]) {
    inventoryItemEle.addEventListener('click', async function (event) {
      if (event.target.classList.contains('no-click-close')) return
      const itemID = parseInt(inventoryItemEle.getAttribute('data-item-id'))
      const item = availableInventory.find(i => i.itemID === itemID)
      console.log('inventoryItemEle', inventoryItemEle, itemID, availableInventory, item)
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
  document.querySelector('.confirm-inventory').addEventListener('click', async () => {
    const selectedInventoryToList = [...document.querySelectorAll('.inventory-item.selected[data-item-id]')].map(a => {
      const inventory = availableInventory.find(i => i.itemID === parseInt(a.getAttribute('data-item-id')))

      const data = deepCopy(inventory.data)
      // data.listingPriceString = a.querySelector('.listing-price').value
      data.listingPrice = listingPriceStringToInt(a.querySelector('.listing-price').value)
      data.appraisal = [{
        type: 'AUTO',
        price: parseInt(a.querySelector('.appraisal div').getAttribute('data-appraisal-value')),
        confidence: a.querySelector('.appraisal div').getAttribute('data-appraisal-confidence')
      }]
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
    await showModalAlert('Listing Payment Details', `
        <p class="mb-3">You will receive an ingame mail containing the payment information. It will also be available on your <a href="/sell">seller</a> page<p>
        <p class="mb-3">In game, search for and right click on the <code>${paymentDetails.corpName}</code> corporation, then click 'Give Money'. Fill in the details as follows</p>

        <div class="alert alert-info fade show col-lg-8 offset-lg-2" role="alert">
          <p class="mb-0 d-flex justify-content-between"><b class="text-">Account:</b> <code>${paymentDetails.account}</code></p>
          <p class="mb-0 d-flex justify-content-between"><b>Amount:</b> <code>${paymentDetails.amount}</code></p>
          <p class="mb-0 d-flex justify-content-between"><b>Reason:</b> <code>${paymentDetails.reason}</code></p>
        </div>

        <p>Please be careful to fill this information in carefully.</p>
        <p>It may take up to 1 hour for the transation to be registered and your items listed.</p>
        `)
    window.location.assign('/sell')
  })
}
const runBatches = async (promises, batchSize) => {
  for (let i = 0; i < promises.length; i += batchSize) {
    const batch = promises.slice(i, i + batchSize)
    // console.log('runBatches START', i)
    await Promise.all(batch.map(promiseFn => promiseFn(i / batchSize)))
    // console.log('runBatches END', i)
  }
}

const updateAppraisals = async (inventory) => {
  await getAppConfig() // Preloading appConfig
  const appraisalElements = [...document.querySelectorAll('.appraisal:not(.appraisal-complete)')]
  const appraisalPromises = appraisalElements.map(appraisalEle => async (batchID) => {
    const itemID = parseInt(appraisalEle.getAttribute('data-item-id'))
    // console.log('itemID START', itemID, batchID)
    const item = inventory.find(i => i.itemID === itemID)
    const appraisal = await getAppraisalForItem(item, batchID, true)
    appraisalEle.innerHTML = `<div class="d-flex flex-row gap-2 align-items-center justify-content-between px-0" data-appraisal-value="${appraisal.price}" data-appraisal-confidence="${appraisal.confidence}">
      <span class="p-0"><p>Appraisal:</p></span>
      <span class="p-0 text-end">
        <p><b>${formatToISKString(appraisal.price)}</b> <i>(${appraisal.type})</i></p>
      </span>
    </div>`
    appraisalEle.parentNode.querySelector('.listing-price').value = typeof appraisal.price === 'string' ? 0 : formatToISKString(appraisal.price).replace(' ISK', '')
    // console.log('itemID END', itemID)
  })

  await runBatches(appraisalPromises, 10)

  // console.log('All appraisals have been processed.')
}
const validateListingPrice = (inputValue) => {
  const digitsString = inputValue.match(/[\d.]+/g)
  const value = parseFloat(digitsString ? digitsString.join('') : '')
  // console.log('validateListingPrice', inputValue, value)
  if (isNaN(value)) return 0

  const inputValueLower = inputValue.toLowerCase().replace('isk', '')
  let unit = ''
  if (inputValueLower.includes('k') || inputValueLower.includes('thou')) unit = 'k'
  else if (inputValueLower.includes('m') || inputValueLower.includes('mil')) unit = 'm'
  else if (inputValueLower.includes('b') || inputValueLower.includes('bil')) unit = 'b'
  else if (inputValueLower.includes('t') || inputValueLower.includes('tril')) unit = 't'
  return value + unit
}
export const initListModInventory = async () => {
  if (doesCurrentCharacterHaveSellerScope()) {
    const userDetails = getCurrentUserDetails()
    renderInventoryPlaceholder(userDetails)
    console.log('Seller logged in, show available mods')
    const { inventory, cacheExpires, lastModified } = await getCurrentUserModInventory()
    inventory.sort((a, b) => a.typeName.localeCompare(b.typeName) || b.qualityScore - a.qualityScore)

    renderAvailableInventory(inventory, cacheExpires, lastModified)
    if (inventory.length > 0) {
      bindInventoryActions(inventory, cacheExpires, lastModified)
    }

    await updateAppraisals(inventory)
  } else {
    window.location.assign('/sell')
  }
}
