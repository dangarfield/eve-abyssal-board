import { updateInventoryFromPublicContracts } from '../app/contracts.js'

const executeJob = async () => {
  await updateInventoryFromPublicContracts()
  process.exit()
}
executeJob()
