import { updateInventoryFromPublicContracts } from '../app/contracts.js'
import { findAndUpdateCompletedPayments } from '../app/payments.js'
import sde from '../../frontend/src/generated-data/sde.json' assert {type:'json'} // assert breaks netlify prod, but is required in heroku
import { updateMissingAppraisals } from '../app/inventory.js'

const executeJob = async () => {
  await findAndUpdateCompletedPayments()
  await updateInventoryFromPublicContracts(sde)
  await updateMissingAppraisals()
  process.exit()
}
executeJob()
