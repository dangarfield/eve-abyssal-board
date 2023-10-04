import { initNav, initTheme } from './nav'
import { handleRouteChange } from './router'
import { loadData, initBackToTop } from './utils'

const init = () => {
  console.log('data', loadData())
  initTheme()
  handleRouteChange()
  initNav()
  initBackToTop()
}
init()
