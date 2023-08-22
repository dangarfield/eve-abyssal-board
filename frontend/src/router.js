import { initAdmin } from './admin'
import { initAdminPendingPayments } from './admin-payments-pending'
import { initAdminCompletePayments } from './admin-payments-complete'
import { triggerLoginFlow, triggerLoginReturnFlow } from './auth'
import { initSellFlow } from './sell'
import { initListModInventory } from './sell-inventory'
import { initAdminJournal } from './admin-journal'
import { displayBuyHome } from './buy'
import { displayTypeSearch } from './buy-search'
import { renderHome } from './home'

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
const routes = [
  { path: '', handler: () => renderHome() },
  { path: '/', handler: () => renderHome() },
  { path: 'home', handler: () => renderHome() },
  { path: '/login', handler: () => triggerLoginFlow() },
  { path: '/login/return', handler: () => triggerLoginReturnFlow() },
  { path: '/sell', handler: () => initSellFlow() },
  { path: '/sell/inventory', handler: () => initListModInventory() },
  { path: '/buy', handler: () => displayBuyHome() },
  { path: '/buy/category/:categoryID', handler: (params) => displayTypeSearch(params.categoryID) },
  { path: '/error', handler: () => renderError() },
  { path: '/admin', handler: () => initAdmin() },
  { path: '/admin/payments-pending', handler: () => initAdminPendingPayments() },
  { path: '/admin/payments-complete', handler: () => initAdminCompletePayments() },
  { path: '/admin/journal', handler: () => initAdminJournal() },
  { path: '*', handler: () => render404() }
]

const updateContent = (route) => {
  let matchedRoute = null

  for (const routeConfig of routes) {
    const routeParts = route.split('/')
    const pathParts = routeConfig.path.split('/')

    if (routeParts.length === pathParts.length) {
      const params = {}
      let isMatch = true

      for (let i = 0; i < pathParts.length; i++) {
        if (pathParts[i].startsWith(':')) {
          const paramName = pathParts[i].substring(1)
          params[paramName] = routeParts[i]
        } else if (pathParts[i] !== routeParts[i]) {
          isMatch = false
          break
        }
      }

      if (isMatch) {
        routeConfig.handler(params)
        matchedRoute = routeConfig
        break
      }
    }
  }

  if (!matchedRoute) {
    render404()
  }
}

export const handleRouteChange = () => {
  console.log('handleRouteChange')
  let route = window.location.pathname
  if (route[0] === '#') route = route.substring(1)
  if (route.endsWith('/')) route = route.slice(0, -1)

  console.log('handleRouteChange', route)
  updateContent(route)
}
// window.addEventListener('hashchange', handleRouteChange)
