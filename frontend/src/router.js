import { initAdmin } from './admin'
import { initAdminPendingPayments } from './admin-payments-pending'
import { initAdminCompletePayments } from './admin-payments-complete'
import { triggerLoginFlow, triggerLoginReturnFlow } from './auth'
import { initSellFlow } from './sell'
import { initListModInventory } from './sell-inventory'

const tempRender = (text) => {
  let html = ''
  html += `
    <div class="container">
        <div class="row">
            <div class="col">
                <div class="alert alert-info my-5" role="alert">
                    <h3>${text} - This page is still under construction</h3>
                </div>
            </div>
        </div>
    </div>
    `
  document.querySelector('.content').innerHTML = html
}
const renderError = () => {
  let html = ''
  html += `
    <div class="container">
        <div class="row">
            <div class="col">
                <div class="alert alert-danger my-5" role="alert">
                    <h3>Error!</h3>
                    <p>Something went wrong! Please contact us and let us know!</p>
                </div>
            </div>
        </div>
    </div>
    `
  document.querySelector('.content').innerHTML = html
}
const render404 = () => {
  let html = ''
  html += `
    <div class="container">
        <div class="row">
            <div class="col">
                <div class="alert alert-danger my-5" role="alert">
                    <h3>404 - Page not found!</h3>
                    <p>We don't think anything should be here, if you do, please contact us and let us know!</p>
                </div>
            </div>
        </div>
    </div>
    `
  document.querySelector('.content').innerHTML = html
}
const updateContent = (route) => {
  switch (route) {
    case '': case '/': case 'home':
      tempRender('home')
      break
    case '/login':
      triggerLoginFlow()
      break
    case '/login/return': case '/login/return/':
      triggerLoginReturnFlow()
      break
    case '/sell':
      initSellFlow()
      break
    case '/sell/inventory':
      initListModInventory()
      break
    case '/buy':
      tempRender('buy')
      break
    case '/error':
      renderError()
      break

    case '/admin':
      initAdmin()
      break
    case '/admin/payments-pending':
      initAdminPendingPayments()
      break
    case '/admin/payments-complete':
      initAdminCompletePayments()
      break

    default:
      render404()
  }
}

export const handleRouteChange = () => {
  console.log('handleRouteChange')
  let route = window.location.pathname
  if (route[0] === '#') route = route.substring(1)
  console.log('handleRouteChange', route)
  updateContent(route)
}
// window.addEventListener('hashchange', handleRouteChange)
