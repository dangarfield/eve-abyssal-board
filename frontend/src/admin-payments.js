import { initAdmin } from './admin'
import { isLoginPasswordSet } from './auth'
import { getPendingPaymentsAdmin, getAppAuth } from './board-api'
import { clearData } from './utils'

const renderPendingPayments = (payments) => {
  console.log('renderPendingPayments', payments)
}

export const initAdminPayments = async () => {
  console.log('initAdminPayments')
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
      // const data = loadData()
      // renderAdminDetails(appAuth, appConfig, data['admin-token'])
      // await triggerPeriodicAdminTask()
    }
    // TODO is null, password is bad, clear password and reload page
  } else {
    console.log('initAdmin - NOT LOGGED IN')
    // triggerAdminLoginFlow()
    window.location.assign('/admin')
  }
}
