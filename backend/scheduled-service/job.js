import { updateInventoryFromPublicContracts } from '../app/contracts.js'
import { findAndUpdateCompletedPayments } from '../app/payments.js'

const executeJob = async () => {
  await findAndUpdateCompletedPayments()
  await updateInventoryFromPublicContracts()
  process.exit()
}
executeJob()
