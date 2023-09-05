import { updateInventoryFromPublicContracts } from '../app/contracts'
import { findAndUpdateCompletedPayments } from '../app/payments'

const executeJob = async () => {
  await findAndUpdateCompletedPayments()
  await updateInventoryFromPublicContracts()
  process.exit()
}
executeJob()
