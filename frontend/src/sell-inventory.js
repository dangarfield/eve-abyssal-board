import { doesCurrentCharacterHaveSellerScope, getCurrentUserDetails } from './auth'
import { getAppConfig, initiateListingFlow } from './board-api'
import { getCurrentUserModInventory } from './esi-api'
import { listingPriceStringToInt, formatToISKString, triggerRefreshTime, showModalAlert } from './utils'
import { getAppraisalForItemId } from './appraisal'
import { renderInventoryCard } from './component/inventory-card'

const renderInventoryPlaceholder = (userDetails) => {
  let html = `
      <div class="container">
          <div class="row">
              <div class="col">
                  <div class="d-grid gap-2 d-md-flex justify-content-between my-2">
                      <h1>Mods are in your hangers - Available to be listed</h1>
                  </div>
                  <p>EVE Online servers cache this data and it is made available to us up to 60 minutes after requesting.</p>
                  <p class="refresh-time-inventory">This text will update with the next refresh time.</p>
                  <p>Select the mods that you wish to sell and add your listing price. You can update the listing price at any time after it is listed.</p>
                  <p><i><b>Note:</b> Once you send a listing fee payment and you cancel after the mod is on sale or sell the item elsewhere, the listing fee will not be returned.</i></p>
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
    html += `
    <div class="row row-cols-lg-auto g-3 align-items-center flex-row-reverse px-2">
      <div class="col-12">
        <input class="form-control ms-2 data-search" type="search" placeholder="Search inventory">
      </div>
      <div class="col-12">
        <div class="form-check form-switch">
          <input class="form-check-input toggle-show-all" type="checkbox" role="switch" id="toggle-show-all" checked>
          <label class="form-check-label" for="toggle-show-all">Show already on sale</label>
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
    html += '<div class="row">'
    for (const item of availableInventory) {
      html += '<div class="col-3 mt-4">'
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

  document.querySelectorAll('.inventory-item').forEach((element) => {
    const text = element.querySelector('.type-name').textContent.toLowerCase()
    const isListed = element.classList.contains('listed')

    // Filter based on search query and hide/show based on hideListed
    const shouldHide = (searchQuery && !text.includes(searchQuery)) || (hideListed && isListed)
    // element.style.display = shouldHide ? 'none' : 'block'
    element.parentElement.style.display = shouldHide ? 'none' : 'block'
  })
}
const bindInventoryActions = (availableInventory, cacheExpires, lastModified) => {
  triggerRefreshTime('.refresh-time-inventory', 'Inventory data', cacheExpires, lastModified)

  document.querySelector('.toggle-show-all').addEventListener('click', function () {
    filterCards()
  })
  document.querySelector('.data-search').addEventListener('input', function () {
    filterCards()
  })
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
      const itemId = parseInt(inventoryItemEle.getAttribute('data-item-id'))
      const item = availableInventory.find(i => i.itemId === itemId)
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
                  <img src="https://images.evetech.net/types/${item.typeId}/icon?size=32">
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
  document.querySelector('.confirm-inventory').addEventListener('click', async () => {
    const selectedInventoryToList = [...document.querySelectorAll('.inventory-item.selected[data-item-id]')].map(a => {
      const inventory = availableInventory.find(i => i.itemId === parseInt(a.getAttribute('data-item-id')))
      inventory.listingPriceString = a.querySelector('.listing-price').value
      inventory.listingPrice = listingPriceStringToInt(a.querySelector('.listing-price').value)
      inventory.appraisalValue = a.querySelector('.appraisal p').textContent.replace('Value: ', '')
      // TODO - Appraisal value seems to have floating point issues
      return inventory
    })
    const selectedInventoryToListShort = selectedInventoryToList.map(a => {
      return {
        itemId: a.itemId,
        typeId: a.typeId,
        typeName: a.typeName,
        sourceTypeId: a.sourceTypeId,
        sourceTypeName: a.sourceTypeName,
        mutatorTypeId: a.mutatorTypeId,
        mutatorTypeName: a.mutatorTypeName,
        abyssalModuleGroup: a.abyssalModuleGroup,
        abyssalModuleCategory: a.abyssalModuleCategory,
        appraisal: {
          type: 'AUTO',
          value: a.appraisalValue
        },
        listingPrice: a.listingPrice,
        attributes: a.attributes.map(d => {
          return {
            attributeId: d.attributeId,
            attributeName: d.attributeName,
            iconID: d.iconID,
            value: d.value,
            sourceValue: d.sourceValue,
            diff: d.diff,
            highIsGood: d.highIsGood,
            isGood: d.isGood,
            min: d.min,
            minPercent: d.minPercent,
            max: d.max,
            maxPercent: d.maxPercent
          }
        })
      }
    })

    for (const item of selectedInventoryToList) {
      if (item.listingPrice === 0) {
        await showModalAlert('Error', '<p>Please ensure the listing prices are above zero</p>')
        return
      }
    }
    console.log('selectedInventoryToList', selectedInventoryToList, selectedInventoryToListShort)
    document.querySelector('.confirm-inventory').setAttribute('disabled', 'disabled')

    const paymentDetails = await initiateListingFlow(selectedInventoryToListShort)
    console.log('paymentDetails', paymentDetails)
    await showModalAlert('Listing Payment Details', `
        <p class="mb-3">You will receive an ingame mail containing the payment information. It will also be available no your <a href="/#/sell">seller</a> page<p>
        <p class="mb-3">In game, search for and right click on the <code>${paymentDetails.corpName}</code> corporation, then click 'Gigve Money'. Fill in the details as follows</p>
        <p class="ps-3 mb-0"><b>Account:</b> <code>${paymentDetails.account}</code></p>
        <p class="ps-3 mb-0"><b>Amount:</b> <code>${paymentDetails.amount}</code></p>
        <p class="ps-3 mb-3"><b>Reason:</b> <code>${paymentDetails.reason}</code></p>
        <p>Please be careful to fill this information in carefully.</p>
        <p>It may take up to 1 hour for the transation to be registered and your items listed.</p>
        `)
    window.location.hash = '#/sell'
  })
}
const updateAppraisals = async () => {
  // console.log('start')
  await Promise.all([...document.querySelectorAll('.appraisal:not(.appraisal-complete)')].map(async appraisalEle => {
    const itemId = appraisalEle.getAttribute('data-item-id')
    const appraisal = await getAppraisalForItemId(itemId)
    // console.log('appraisalEle', appraisalEle, itemId, appraisal)
    appraisalEle.innerHTML = `<p>Value: ${appraisal.value} <i>(Confidence: ${appraisal.confidence})</></p>`
    appraisalEle.parentNode.querySelector('.listing-price').value = validateListingPrice(appraisal.value)
    return appraisalEle
  }))
  // console.log('end')
}
const validateListingPrice = (inputValue) => {
  const digitsString = inputValue.match(/[\d.]+/g)
  const value = parseFloat(digitsString ? digitsString.join('') : '')
  console.log('validateListingPrice', inputValue, value)
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
    renderAvailableInventory(inventory, cacheExpires, lastModified)
    bindInventoryActions(inventory, cacheExpires, lastModified)
    await updateAppraisals()
  } else {
    window.location.hash = '#/sell'
  }
}
