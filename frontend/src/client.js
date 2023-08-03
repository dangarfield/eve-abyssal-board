import { initNav } from './nav'
import { handleRouteChange } from './router'
import { loadData } from './utils'

const init = () => {
  console.log('data', loadData())
  handleRouteChange()
  initNav()
}
init()
