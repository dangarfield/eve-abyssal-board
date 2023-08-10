import sde from './generated-data/sde.json'
import { getUnitStringForUnitId } from './module-types'

export const getUnitForDogma = (id) => {
  const unit = getUnitStringForUnitId(sde.dogmaAttributes[id].unitID)
  return unit
}
