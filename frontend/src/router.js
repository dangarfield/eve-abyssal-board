import { triggerLoginFlow, triggerLoginReturnFlow } from './auth'
import { initSellFlow, initListModInventory } from './sell'

const tempRender = (text) => { document.querySelector('.content').innerHTML = text }

const renderError = () => {
  let html = ''
  html += `
    <div class="container">
        <div class="row">
            <div class="col">
                <div class="alert alert-danger" role="alert">
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
                <div class="alert alert-danger" role="alert">
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

    default:
      render404()
  }
}

export const handleRouteChange = () => {
  let route = window.location.hash
  if (route[0] === '#') route = route.substring(1)
  console.log('handleRouteChange', route)
  updateContent(route)
}
window.addEventListener('hashchange', handleRouteChange)
