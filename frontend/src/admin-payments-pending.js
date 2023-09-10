import { initAdmin } from './admin'
import { isLoginPasswordSet } from './auth'
import { getPendingPaymentsAdmin, getAppAuth, cancelPayment, updatePayment } from './board-api'
import { clearData } from './utils'
import { Grid, h } from 'gridjs'
import { renderAdminHeader } from './component/admin-header'

const renderPendingPayments = (payments) => {
  console.log('renderPendingPayments', payments)

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
        <div class="payment-grid"></div>
      </div>
    </div>
  </div>`
  document.querySelector('.content').innerHTML = html

  const paymentsCol = payments.map((p, i) => [i, p._id, p.characterId, p.characterName, p.type, p.inventory.length + 'x', p.creationDate, p.amount, p.paid ? 'PAID' : 'AWAITING'])
  console.log('paymentsCol', paymentsCol)
  new Grid({
    columns: [
      { name: 'i', hidden: true },
      { name: 'ID', sort: true },
      { name: 'Character ID', sort: true },
      { name: 'Character Name', sort: true },
      { name: 'Type', sort: true },
      { name: 'Inventory', sort: true },
      { name: 'Creation Date', sort: true },
      { name: 'Amount', sort: true, formatter: (cell) => cell.toLocaleString() },
      { name: 'Paid', sort: true },
      {
        name: 'Cancel',
        formatter: (cell, row) => {
          return h('button', {
            className: 'btn btn-danger w-100',
            onClick: async () => {
              await cancelPayment(payments[row.cells[0].data]._id)
              window.location.reload()
            }
          }, 'Cancel')
        }
      },
      {
        name: 'Mark PAID',
        formatter: (cell, row) => {
          return h('button', {
            className: 'btn btn-success w-100',
            onClick: async () => {
              console.log('Mark Paid', payments[row.cells[0].data]._id)
              await updatePayment(payments[row.cells[0].data]._id, { paid: true })
              window.location.reload()
            }
          }, 'Mark PAID')
        }
      }
    ],
    data: paymentsCol,
    search: true
  }).render(document.querySelector('.payment-grid'))
}

export const initAdminPendingPayments = async () => {
  console.log('initAdminPendingPayments')
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
      const payments = await getPendingPaymentsAdmin()
      renderPendingPayments(payments)
    }
    // TODO is null, password is bad, clear password and reload page
  } else {
    console.log('initAdmin - NOT LOGGED IN')
    // triggerAdminLoginFlow()
    window.location.assign('/admin')
  }
}
