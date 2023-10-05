import { initAdmin } from './admin'
import { isLoginPasswordSet } from './auth'
import { getCompletePaymentsAdmin, getAppAuth } from './board-api'
import { clearData, formatToISKString } from './utils'
import { Grid } from 'gridjs'
import { renderAdminHeader } from './component/admin-header'

const sumColumns = (data, columnIndices) => {
  const sums = Array(columnIndices.length).fill(0)

  data.forEach(row => {
    columnIndices.forEach((columnIndex, index) => {
      sums[index] += row[columnIndex]
    })
  })

  return sums
}
const renderButton = (text, value, cssClass) => {
//   return `<button type="button" class="btn ${cssClass} position-relative">
//   ${text}
//   <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
//     ${value}
//   </span>
// </button>
// `
  return `<button type="button" class="btn ${cssClass} w-100 mb-2">
${text} <span class="badge text-bg-danger fs-6">${value}</span>
        </button>`
}
const renderCompletePayments = (payments, stores) => {
  console.log('renderCompletePayments', payments)

  const paymentsCol = payments.map((p, i) => {
    const listingFee = p.types.find(t => t.type === 'LISTING_FEE')
    const priceChangeFee = p.types.find(t => t.type === 'PRICE_CHANGE_FEE')
    const storefrontFee = p.types.find(t => t.type === 'STOREFRONT_FEE')
    if (storefrontFee && storefrontFee.totalAmount > 0) storefrontFee.inventoryCount = 1
    const premiumFee = p.types.find(t => t.type === 'PREMIUM_FEE')
    const total = (listingFee ? listingFee.totalAmount : 0) + (priceChangeFee ? priceChangeFee.totalAmount : 0) +
     (storefrontFee ? storefrontFee.totalAmount : 0) + (premiumFee ? premiumFee.totalAmount : 0)
    return [
      i,
      p._id.characterId,
      p._id.characterName,
      listingFee ? listingFee.inventoryCount : 0,
      listingFee ? listingFee.totalAmount : 0,
      priceChangeFee ? priceChangeFee.inventoryCount : 0,
      priceChangeFee ? priceChangeFee.totalAmount : 0,
      storefrontFee ? storefrontFee.inventoryCount : 0,
      storefrontFee ? storefrontFee.totalAmount : 0,
      premiumFee ? premiumFee.inventoryCount : 0,
      premiumFee ? premiumFee.totalAmount : 0,
      total]
  })

  const storesHtml = stores.map(s => `<a class="btn btn-primary me-2" target="_blank" href="/store/${s.storefront.url}">${s.storefront.url}</a>`).join('')
  console.log('paymentsCol', paymentsCol)

  const totals = sumColumns(paymentsCol, [3, 4, 5, 6, 7, 8, 9, 10, 11])
  console.log('totals', totals)

  let html = ''
  html += `
  <div class="container-fluid pt-3">
    <div class="row">
      <div class="col">
        ${renderAdminHeader()}
      </div>
    </div>
    <div class="row">
      <div class="col">
        ${renderButton('Customers', payments.length, 'btn-success')}
        ${renderButton('Total Ƶ', formatToISKString(totals[8]), 'btn-success')}
      </div>
      <div class="col">
        ${renderButton('Listing No.', totals[0], 'btn-primary')}
        ${renderButton('Listing Ƶ', formatToISKString(totals[1]), 'btn-primary')}
      </div>
      <div class="col">
        ${renderButton('Price Change No.', totals[2], 'btn-secondary')}
        ${renderButton('Price Change Ƶ', formatToISKString(totals[3]), 'btn-secondary')}
      </div>
      <div class="col">
        ${renderButton('Storefront No.', totals[4], 'btn-primary')}
        ${renderButton('Storefront Ƶ', formatToISKString(totals[5]), 'btn-primary')}
      </div>
      <div class="col">
        ${renderButton('Premium No.', totals[6], 'btn-secondary')}
        ${renderButton('Premium Ƶ', formatToISKString(totals[7]), 'btn-secondary')}
      </div>
    </div>
    <div class="row">
      <div class="col">
        <div class="payment-complete-grid"></div>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <p>Stores: ${storesHtml}</p>
      </div>
    </div>
  </div>`
  document.querySelector('.content').innerHTML = html

  new Grid({
    columns: [
      { name: 'i', hidden: true },
      { name: 'Character ID', sort: true },
      { name: 'Character Name', sort: true },
      { name: 'LIST No.', sort: true },
      { name: 'LIST Ƶ', sort: true, formatter: (cell) => cell.toLocaleString() },
      { name: 'PRICE CHANGE No.', sort: true },
      { name: 'PRICE CHANGE Ƶ', sort: true, formatter: (cell) => cell.toLocaleString() },
      { name: 'Storefront No.', sort: true },
      { name: 'Storefront Ƶ', sort: true, formatter: (cell) => cell.toLocaleString() },
      { name: 'Premium No.', sort: true },
      { name: 'Premium Ƶ', sort: true, formatter: (cell) => cell.toLocaleString() },
      { name: 'Total Ƶ', sort: true, formatter: (cell) => cell.toLocaleString() }
    ],
    data: paymentsCol,
    search: true
  }).render(document.querySelector('.payment-complete-grid'))
}

export const initAdminCompletePayments = async () => {
  console.log('initAdminCompletePayments')
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
      // const appConfig = await getAppConfigAdmin()
      console.log('LOGGED IN!!! ADMIN PAYMENTS', appAuth)
      const { payments, stores } = await getCompletePaymentsAdmin()
      renderCompletePayments(payments, stores)
    }
    // TODO is null, password is bad, clear password and reload page
  } else {
    console.log('initAdmin - NOT LOGGED IN')
    // triggerAdminLoginFlow()
    window.location.assign('/admin')
  }
}
