import { doesCurrentCharacterHaveSellerScope, getCurrentUserDetails, triggerLoginFlow } from './auth'
import { getAppConfig, getCurrentSellerInventory, getCurrentSellerPayments } from './board-api'
import { renderInventoryCard } from './component/inventory-card'
import { formatToISKString } from './utils'

const askForSellerScopePermission = () => {
  const html = `
    <div class="container">
        <div class="row">
            <div class="col text-center my-2">
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
                <div class="d-grid gap-2 d-md-flex justify-content-between my-2">
                    <h1>Hi ${userDetails.characterName}! Here are your mod listings!</h1>
                    <a href="#/sell/inventory" class="btn btn-primary align-self-center" type="button"><i class="bi bi-plus-lg"></i> Add new mod listings</a>
                </div>
            </div>
        </div>
        <div class="payment-content">
        </div>
        <div class="inventory-content">
        </div>
        <div class="placeholder-content">

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
    // html += `
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
    html += `
    <div class="row row-cols-lg-auto g-3 align-items-center flex-row-reverse px-2">
      <div class="col-12">
        <input class="form-control ms-2 data-search" type="search" placeholder="Search listings">
      </div>
      <div class="col-12">
        <select class="form-select filter-status">
            <option value="AWAITING_PAYMENT,ON_SALE" selected>Filter: Active</option>
            <option value="AWAITING_PAYMENT,ON_SALE,CANCELLED,SOLD">Filter: All</option>
            <option value="ON_SALE">Filter: On Sale</option>
            <option value="AWAITING_PAYMENT">Filter: Awaiting Payment</option>
            <option value="SOLD">Filter: Sold</option>
            <option value="CANCELLED">Filter: Cancelled</option>
        </select>
      </div>
    </div>
`
    html += '<div class="row">'
    for (const listedItem of listedItems) {
      html += `
        <div class="col-3 mt-4">
            ${renderInventoryCard(listedItem)}
        </div>`
    }
    html += '</div>'
  }
  document.querySelector('.inventory-content').innerHTML = html
  document.querySelector('.placeholder-content').remove()
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
}
const renderPaymentsListing = (payments, appConfig) => {
  let html = ''
  if (payments.length === 0) {
    html = `
          <div class="row mt-4">
              <div class="col">
                  <div class="alert alert-info" role="alert">
                      <p class="m-0">No payments required</p>
                  </div>
              </div>
          </div>
          `
  } else {
    html += `<div class="row">
        <div class="col-12">
            <h4>Outstanding Payments</h4>
            <p>Payments should be made in game to <code>${appConfig.corpName}</code>. Right click, give ISK. Always pay into the <code>${appConfig.corpDivisionName}</code> account with the reason shown below.</p>
            <p>Any issues? Contact us on discord. <i><b>Note:</b> Payments take up to 1 hour to be registered</i></p>
        </div>
    </div>`

    html += `
        <div class="row row-cols-lg-auto g-3 align-items-center flex-row-reverse px-2">
          <div class="col-12">
            <div class="form-check form-switch ms-2">
              <input class="form-check-input show-completed-payments" type="checkbox" role="switch" id="show-completed-payments">
              <label class="form-check-label" for="show-completed-payments">Show completed payments</label>
            </div>
          </div>
        </div>
        <div class="row">
    `
    for (const payment of payments) {
      html += `
          <div class="col-3"${payment.paid ? ' style="display:none;"' : ''}>
              <div class="card ${payment.paid ? 'border-success' : 'border-danger'} h-100 payment" role="button"${payment.inventory ? ` data-paid="${payment.paid}" data-inventory="${payment.inventory.join(',')}"` : ''}>
                <div class="card-body">
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
                            <span class="">${payment.type} of ${payment.inventory.length} mod${payment.inventory.length > 1 ? 's' : ''}</span>
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
      document.querySelectorAll('.payment').forEach((element) => {
        const isPaid = element.getAttribute('data-paid') === 'true'
        if (isPaid && !showAll) {
          element.parentElement.style.display = 'none'
        } else {
          element.parentElement.style.display = 'block'
        }
      })
    })
  }
  for (const paymentEle of [...document.querySelectorAll('.payment')]) {
    paymentEle.addEventListener('mouseenter', () => {
      const inventory = paymentEle.getAttribute('data-inventory')
      if (inventory === undefined) {
        return
      }
      const inventories = inventory.split(',')
      console.log('mouseenter', inventories)

      document.querySelectorAll('.inventory-item').forEach((element) => {
        const itemId = element.getAttribute('data-item-id')
        const shouldHide = !inventories.includes(itemId)
        console.log('element', element, itemId, shouldHide)
        element.parentElement.style.display = shouldHide ? 'none' : 'block'
      })
    })
    paymentEle.addEventListener('mouseleave', () => {
      //
      console.log('mouseleave')
      filterCards()
    })
  }
}
const filterCards = () => {
  const searchQuery = document.querySelector('.data-search').value.toLowerCase()
  const allowedStatuses = document.querySelector('.filter-status').value
  //   const hideListed = !document.querySelector('.toggle-show-all').checked
  document.querySelectorAll('.inventory-item').forEach((element) => {
    // TODO - Update
    const text = element.querySelector('.type-name').textContent.toLowerCase()
    const status = element.getAttribute('data-status')
    // const isListed = element.classList.contains('listed')
    const shouldHide = (searchQuery && !text.includes(searchQuery)) || (!allowedStatuses.includes(status))
    element.parentElement.style.display = shouldHide ? 'none' : 'block'
  })
  console.log('filterCards')
}
const displayPayments = async () => {
  const appConfig = await getAppConfig()

  const payments = await getCurrentSellerPayments()
  console.log('payments', payments)
  renderPaymentsListing(payments, appConfig)
}
const displayInventory = async () => {
  const listedItems = await getCurrentSellerInventory()
  console.log('listedItems', listedItems)
  renderSellerListing(listedItems)
}
export const initSellFlow = async () => {
  if (doesCurrentCharacterHaveSellerScope()) {
    const userDetails = getCurrentUserDetails()
    renderSellerPlaceholder(userDetails)
    console.log('Seller logged in, show sell page')
    await Promise.all([displayPayments(), displayInventory()])
  } else {
    console.log('No seller scope')
    askForSellerScopePermission()
  }
}
