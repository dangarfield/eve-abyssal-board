import { updateInventoryFromPublicContracts } from '../app/contracts-heroku.js'
import { findAndUpdateCompletedPayments } from '../app/payments.js'

const executeJob = async () => {
  await findAndUpdateCompletedPayments()
  await updateInventoryFromPublicContracts()
  process.exit()
}
executeJob()
