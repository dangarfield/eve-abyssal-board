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
  return `<button type="button" class="btn ${cssClass}">
${text} <span class="badge text-bg-danger">${value}</span>
        </button>`
}
const renderCompletePayments = (payments) => {
  console.log('renderCompletePayments', payments)

  const paymentsCol = payments.map((p, i) => {
    const listingFee = p.types.find(t => t.type === 'LISTING_FEE')
    const appraisalFee = p.types.find(t => t.type === 'APPRAISAL_FEE')
    const total = (listingFee ? listingFee.totalAmount : 0) + (appraisalFee ? appraisalFee.totalAmount : 0)
    return [
      i,
      p._id.characterId,
      p._id.characterName,
      listingFee ? listingFee.inventoryCount : 0,
      listingFee ? listingFee.totalAmount : 0,
      appraisalFee ? appraisalFee.inventoryCount : 0,
      appraisalFee ? appraisalFee.totalAmount : 0,
      total]
  })

  console.log('paymentsCol', paymentsCol)

  const totals = sumColumns(paymentsCol, [3, 4, 5, 6, 7])
  console.log('totals', totals)

  let html = ''
  html += `
  <div class="container pt-3">
    <div class="row">
      <div class="col">
        ${renderAdminHeader()}
        <p>Stats:
        ${renderButton('Customers', payments.length, 'btn-secondary')}
        ${renderButton('Listing No.', totals[0], 'btn-primary')}
        ${renderButton('Listing Ƶ', formatToISKString(totals[1]), 'btn-primary')}
        ${renderButton('Appraisal No.', totals[2], 'btn-secondary')}
        ${renderButton('Appraisal Ƶ', formatToISKString(totals[3]), 'btn-secondary')}
        ${renderButton('Total Ƶ', formatToISKString(totals[4]), 'btn-success')}
        </p>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <div class="payment-complete-grid"></div>
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
      { name: 'APPRAISAL No.', sort: true },
      { name: 'APPRAISAL Ƶ', sort: true, formatter: (cell) => cell.toLocaleString() },
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
      const payments = await getCompletePaymentsAdmin()
      renderCompletePayments(payments)
    }
    // TODO is null, password is bad, clear password and reload page
  } else {
    console.log('initAdmin - NOT LOGGED IN')
    // triggerAdminLoginFlow()
    window.location.assign('/admin')
  }
}
