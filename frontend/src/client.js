import { initNav } from './nav'
import { handleRouteChange } from './router'
import { loadData, initBackToTop } from './utils'

const init = () => {
  console.log('data', loadData())
  handleRouteChange()
  initNav()
  initBackToTop()
}
init()
