import { doesCurrentCharacterHaveSellerScope, getCurrentUserDetails, triggerLoginFlow } from './auth'
import { amendListing, cancelListing, getAppConfig, getCurrentSellerInventory, getCurrentSellerPayments, getCurrentSellerData, setCurrentSellerData } from './board-api'
import { renderInventoryCard } from './component/inventory-card'
import { inventoryToInventoryCardDTO } from './dogma-utils'
import { formatToISKString, listingPriceStringToInt, showModalAlert } from './utils'

const askForSellerScopePermission = () => {
  const html = `
<div class="container">
  <div class="row">
    <div class="col my-5 pagetitle">
      <h2>Become a seller</h2>
    </div>
  </div>
  <div class="row">
    <div class="col-lg-6">
      <div class="card h-100">
        <div class="card-body">
          <h5 class="card-title">Sell with us</h5>
          <p>In order to sell with us, we need to ask for permission to view your assets.</p>
          <p>Click below to log in with EVE Online Single Sign On and it will ask for these specfic permissions</p>
          <div class="text-center">
            <button class="btn p-0 border-0 login-seller">
              <img src="https://web.ccpgamescdn.com/eveonlineassets/developers/eve-sso-login-white-small.png" alt="EVE SSO Login Buttons Small Black">
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="col-lg-6">
      <div class="card h-100 text-bg-info-subtle">
        <div class="card-body">
          <h5 class="card-title">Scopes used:</h5>
          <ul>
            <li><b>esi-assets.read_assets.v1</b> - Identifies the assets in your characters.
            These are filtered by abyssal types and presented to you for you to automatically create a listing</li>
          </ul>
          <p class="card-text"><i>Note: No information is sent or used by Abyssal Board other than identifying and validating the items for sale.
          This includes refresh tokens. They are all persisted in your browser and not on any Abyss Board servers. We have no way of refreshing your tokens ourselves.</i></p>
        </div>
      </div>
    </div>
  </div>
</div>`
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
                <div class="d-grid gap-2 d-md-flex justify-content-between my-5 pagetitle">
                  <h2 class="">Hi ${userDetails.characterName}! Here are your mod listings!</h2>
                  <a href="/sell/inventory" class="btn btn-primary align-self-center" type="button"><i class="bi bi-plus-lg"></i> Add new mod listings</a>
                </div>
            </div>
        </div>
        <div class="settings-content">
        </div>
        <div class="payment-content">
        </div>
        <div class="inventory-content">
        </div>
        <div class="placeholder-content">

            <div class="row mt-4">
                <div class="col placeholder-glow">
                    <span class="placeholder col-lg-3"></span>
                    <span class="placeholder col-lg-6"></span>
                    <span class="placeholder col-lg-2"></span>
                </div>
            </div>
            <div class="row">
        `
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
                </div>
    `
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
    `
  document.querySelector('.content').innerHTML = html
}

const renderSellerListing = (listedItems) => {
  let html = ''
  if (listedItems.length === 0) {
    html = `
        <div class="row mt-4">
            <div class="col">
                <div class="card text-bg-info-subtle">
                  <div class="card-body text-center">
                    <div class="pt-3">
                      <i class="bi bi-info-circle fs-1 text-info card-title"></i>
                    </div>
                    <h5 class="card-title">No items listed - Click on the <code>Add new mod listings</code> button to select one to sell</h5>
                  </div>
                </div>
            </div>
        </div>
        `
  } else {
    html += `
    <div class="row row-cols-lg-auto g-3 align-items-center flex-row-reverse px-2">
      <div class="col">
        <input class="form-control ms-2 data-search" type="search" placeholder="Search listings">
      </div>
      <div class="col">
        <select class="form-select filter-status">
            <option value="AWAITING_PAYMENT,ON_SALE" selected>Filter: Active</option>
            <option value="AWAITING_PAYMENT,ON_SALE,COMPLETE">Filter: All</option>
            <option value="ON_SALE">Filter: On Sale</option>
            <option value="AWAITING_PAYMENT">Filter: Awaiting Payment</option>
            <option value="COMPLETE">Filter: Complete / Sold</option>
        </select>
      </div>
    </div>
`
    html += `
        <div class="row mt-4 all-items-filtered" style="display:none;">
          <div class="col">
            <div class="card text-bg-info-subtle">
              <div class="card-body text-center">
                <div class="pt-3">
                  <i class="bi bi-info-circle fs-1 text-info card-title"></i>
                </div>
                <h5 class="card-title">Some listed mods are hidden - Use <code>Filter: All</code> to see all item</h5>
              </div>
            </div>
          </div>

        </div>
        `
    html += '<div class="row mb-4">'
    for (const listedItem of listedItems) {
      html += `
        <div class="col-lg-3 mt-4">
            ${renderInventoryCard(listedItem)}
        </div>`
    }
    html += '</div>'
  }
  document.querySelector('.inventory-content').innerHTML = html
  document.querySelector('.placeholder-content').remove()
  if (listedItems.length > 0) {
    document.querySelector('.data-search').addEventListener('input', function () {
      const value = this.value
      console.log('value', value)
      filterCards()
    })
    document.querySelector('.filter-status').addEventListener('change', function () {
      const value = this.value
      console.log('value', value)
      filterCards()
    })
    filterCards()
  }

  for (const invAwaitingEle of [...document.querySelectorAll('.inventory-item.awaiting-payment')]) {
    invAwaitingEle.addEventListener('click', async () => {
      const itemID = parseInt(invAwaitingEle.getAttribute('data-item-id'))
      const payment = payments.find(p => p.inventory.includes(itemID))
      const otherInventories = payment.inventory.filter(pi => pi !== itemID)
      console.log('awaiting-payment', itemID, payment, otherInventories)

      const otherInvWording = otherInventories.length > 0 ? `<p><i><b>Note:</b> This mod was listed at the same time with ${otherInventories.length} other mod${otherInventories.length > 1 ? 's' : ''}. The listing fee due balance will be updated to include only the remaining items</i></p>` : ''
      await showModalAlert('Cancel Listing', `
      <p>It doesn't look as though you've paid a listing fee yet, so nothing is lost!</p>
      <p>If you cancel this listing, it'll disappear from this screen along with any payment reminders, if you want to relist it, simply add a new mod listing as before.</p>
      ${otherInvWording}`, [{
        buttonText: 'Cancel listing',
        style: 'btn-danger',
        cb: async () => {
          console.log('callback', invAwaitingEle, itemID)
          await cancelListing(itemID)
          console.log('listing cancelled')
          window.location.reload()
        }
      }])
    })
  }
  for (const invOnSaleEle of [...document.querySelectorAll('.inventory-item.on-sale')]) {
    invOnSaleEle.addEventListener('click', async () => {
      const itemID = parseInt(invOnSaleEle.getAttribute('data-item-id'))
      const listingPrice = listedItems.find(i => i.itemID === itemID).listingPrice
      console.log('on-sale', itemID, listedItems, listingPrice)
      await showModalAlert('Amend Listing', `
      <p>You've already paid the listing fee, if you want to cancel or have sold it elsewhere, the listing fee will not be returned.</p>
      <p>If you cancel this listing, it'll disappear from this screen along but the completed payments will remain visible. If you want to relist it, simply add a new mod listing as before.</p>
      <div class="row align-items-center">
        <div class="col-auto">
          <label for="list-price-modal" class="col-form-label">Listing Price</label>
        </div>
        <div class="col">
          <input type="text" id="list-price-modal" class="form-control list-price-modal" value="${formatToISKString(listingPrice).replace(' ISK', '').trim()}">
        </div>
      </div>

      `, [{
        buttonText: 'Cancel listing',
        style: 'btn-danger',
        cb: async () => {
          console.log('callback', invOnSaleEle, itemID)
          await cancelListing(itemID)
          console.log('listing cancelled')
          window.location.reload()
        }
      }, {
        buttonText: 'Listing complete / sold',
        style: 'btn-success',
        cb: async () => {
          console.log('callback', invOnSaleEle, itemID)
          await amendListing(itemID, { status: 'COMPLETE' })
          console.log('listing complete')
          window.location.reload()
        }
      }, {
        buttonText: 'Update list price',
        style: 'btn-primary',
        cb: async () => {
          console.log('callback', invOnSaleEle, itemID)
          // await amendListing(itemID, { status: 'COMPLETE' })
          const listingPriceString = document.querySelector('.list-price-modal').value
          const listingPrice = listingPriceStringToInt(listingPriceString)
          console.log('listing complete', listingPriceString, listingPrice)
          await amendListing(itemID, { listingPrice })
          invOnSaleEle.querySelector('.listing-price').innerHTML = `<p>Listing price: <b>${formatToISKString(listingPrice)}</b></p>`
          document.querySelector('.modal .btn-close').click()
        }
      }])
    })
  }
}
const renderPaymentsListing = (payments, appConfig) => {
  let html = ''
  if (payments.length === 0) {
    html = `
          <div class="row mt-4">
              <div class="col">
                <div class="card text-bg-info-subtle">
                  <div class="card-body text-center">
                    <div class="pt-3">
                      <i class="bi bi-info-circle fs-1 text-info card-title"></i>
                    </div>
                    <h5 class="card-title">You don't have any payments awaiting settlement</h5>
                  </div>
                </div>
              </div>
          </div>
          `
  } else {
    html += `
  <div class="row">
    <div class="col-lg-12">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">Outstanding Payments</h5>
          <p>Payments should be made in game to <code>${appConfig.corpName}</code>. Right click then 'Give ISK'. Always pay into the <code>${appConfig.corpDivisionName}</code> account with the reason shown below.</p>
          <p>Any issues? Contact us on <a href="${appConfig.discordUrl}" target="_blank">discord</a>. <i><b>Note:</b> Payments take up to 1 hour to be registered</i></p>
        </div>
      </div>
    </div>
  </div>`
    html += `
  <div class="row row-cols-lg-auto align-items-center flex-row-reverse mb-4">
    <div class="col-12">
      <div class="form-check form-switch">
        <input class="form-check-input show-completed-payments" type="checkbox" role="switch" id="show-completed-payments">
        <label class="form-check-label" for="show-completed-payments">Show completed payments</label>
      </div>
    </div>
  </div>
  <div class="row">
    <div class="col-lg-12 payments-filtered">
      <div class="card text-bg-info-subtle">
        <div class="card-body text-center">
          <div class="pt-3">
            <i class="bi bi-info-circle fs-1 text-info card-title"></i>
          </div>
          <h5 class="card-title">You don't have any unpaid bills but some payments are hidden - Use <code>Show completed payments</code> to see all payments</h5>
        </div>
      </div>
    </div>
    `
    for (const payment of payments) {
      html += `
    <div class="col-lg-3"${payment.paid ? ' style="display:none;"' : ''}>
      <div class="card payment" role="button"${payment.inventory ? ` data-paid="${payment.paid}" data-inventory="${payment.inventory.join(',')}"` : ''}>
        <div class="card-body border ${payment.paid ? 'border-success' : 'border-danger'} rounded pt-4">
          <div class="d-flex">
            <div class="flex-grow-1">
              <h5 class="">${payment.paid ? 'PAID' : 'Amount Due'}: </h5>
            </div>
            <div class="text-end">
              <h5 class="">${formatToISKString(payment.amount)}</h5>
            </div>
          </div>
          <div class="d-flex">
            <div class="flex-grow-1">
              <h6 class="">Reason / Ref: </h6>
            </div>
            <div class="text-end">
              <code class="fs-6">${payment.id}</code>
            </div>
          </div>
          <div class="d-flex">
            <div class="flex-grow-1">
              <h6 class="">Type: </h6>
            </div>
            <div class="text-end">
              <span class="">${payment.type.replace('_', ' ')} (${payment.inventory.length} mod${payment.inventory.length > 1 ? 's' : ''})</span>
            </div>
          </div>
        </div>
      </div>
    </div>`
    }
    html += '</div>'
  }
  // TODO - Hide paid payments
  document.querySelector('.payment-content').innerHTML = html

  const showCompletedPaymentsEle = document.querySelector('.show-completed-payments')
  if (showCompletedPaymentsEle) {
    showCompletedPaymentsEle.addEventListener('change', () => {
      const showAll = showCompletedPaymentsEle.checked
      let somePaymentsAreHidden = false
      document.querySelectorAll('.payment').forEach((element) => {
        const isPaid = element.getAttribute('data-paid') === 'true'
        if (isPaid && !showAll) {
          element.parentElement.style.display = 'none'
        } else {
          element.parentElement.style.display = 'block'
          somePaymentsAreHidden = true
        }
      })
      document.querySelector('.payments-filtered').style.display = somePaymentsAreHidden ? 'none' : 'block'
    })
    const visiblePaymentCount = Array.from(document.querySelectorAll('.payment')).filter(element => element.getAttribute('data-paid') === 'false').length
    console.log('visiblePaymentCount', visiblePaymentCount)
    if (visiblePaymentCount > 0) document.querySelector('.payments-filtered').style.display = 'none'
  }
  for (const paymentEle of [...document.querySelectorAll('.payment')]) {
    paymentEle.addEventListener('mouseenter', () => {
      const inventory = paymentEle.getAttribute('data-inventory')
      if (inventory === undefined) {
        return
      }
      const inventories = inventory.split(',')
      //   console.log('mouseenter', inventories)
      document.querySelectorAll('.inventory-item').forEach((element) => {
        const itemID = element.getAttribute('data-item-id')
        const shouldHide = !inventories.includes(itemID)
        // console.log('element', element, itemID, shouldHide)
        element.parentElement.style.display = shouldHide ? 'none' : 'block'
      })
    })
    paymentEle.addEventListener('mouseleave', () => {
    //   console.log('mouseleave')
      filterCards()
    })
  }
}
const filterCards = () => {
  const searchQuery = document.querySelector('.data-search').value.toLowerCase()
  const allowedStatuses = document.querySelector('.filter-status').value
  let count = 0
  let hidden = 0
  document.querySelectorAll('.inventory-item').forEach((element) => {
    const text = element.querySelector('.type-name').textContent.toLowerCase()
    const status = element.getAttribute('data-status')
    const shouldHide = (searchQuery && !text.includes(searchQuery)) || (!allowedStatuses.includes(status))
    if (shouldHide) hidden++
    element.parentElement.style.display = shouldHide ? 'none' : 'block'
    count++
  })
  if (count > 0 && count === hidden) {
    document.querySelector('.all-items-filtered').style.display = 'block'
  } else {
    document.querySelector('.all-items-filtered').style.display = 'none'
  }
  console.log('filterCards', count, hidden)
}
let payments
const displayPayments = async () => {
  const appConfig = await getAppConfig()
  payments = await getCurrentSellerPayments()
  console.log('payments', payments)
  renderPaymentsListing(payments, appConfig)
}
const displayInventory = async () => {
  const listedItems = (await getCurrentSellerInventory()).map(i => inventoryToInventoryCardDTO(i))
  listedItems.sort((a, b) => a.typeName.localeCompare(b.typeName) || b.qualityScore - a.qualityScore)
  console.log('listedItems', listedItems)
  renderSellerListing(listedItems)
}
const renderSellerSettings = async (sellerData) => {
  const appConfig = await getAppConfig()
  let html = ''
  html += `
  <div class="row mb-4">
    <div class="col-lg-8">
      <div class="card h-100">
        <div class="card-body pb-0">
          <h5 class="card-title">Seller Settings</h5>
          <p>Buyers will be shown your EVE details, but to make it even easier and quicker, join <a href="${appConfig.discordUrl}" target="_blank">Abyss Trading Discord</a>. By adding your username, buyers can negotiate with you more directly</p>
          <p>Don't forget to update any sold or no longer available modules here, so that you get get any unwanted offers and PMs</p>
        </div>
      </div>
    </div>
    <div class="col-lg-4">
      <div class="card h-100">
        <div class="card-body pb-0">
          <h5 class="card-title">Discord Settings</h5>
          <form class="seller-settings row g-3">
            <div class="col-md-12">
              <div class="form-floating">
                <input type="text" class="form-control discord-name" id="discord-name" value="${sellerData.discordName}">
                <label for="discord-name">Discord Name</label>
              </div>
            </div>
            <div class="text-end">
              <button type="submit" class="btn btn-primary">Save Settings</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
`
  document.querySelector('.settings-content').innerHTML = html

  document.querySelector('.seller-settings').addEventListener('submit', async (event) => {
    event.preventDefault()
    const discordName = document.querySelector('.discord-name').value
    console.log('discordName', discordName)
    await setCurrentSellerData({ discordName })
    showModalAlert('Success', 'Settings saved')
  })
}
const displaySellerSettings = async () => {
  const sellerData = await getCurrentSellerData()
  if (sellerData.discordName === undefined) sellerData.discordName = ''
  console.log('sellerData', sellerData)
  renderSellerSettings(sellerData)
}
export const initSellFlow = async () => {
  if (doesCurrentCharacterHaveSellerScope()) {
    const userDetails = getCurrentUserDetails()
    renderSellerPlaceholder(userDetails)
    console.log('Seller logged in, show sell page')
    await getAppConfig()
    await Promise.all([displaySellerSettings(), displayPayments(), displayInventory()])
  } else {
    console.log('No seller scope')
    askForSellerScopePermission()
  }
}
