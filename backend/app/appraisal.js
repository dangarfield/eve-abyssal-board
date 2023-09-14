import { runBatches } from './contracts'

const predictionConfidence = (conf) => {
  if (conf > 0.98) {
    return 'Extremely high'
  } else if (conf > 0.95) {
    return 'Very high'
  } else if (conf > 0.90) {
    return 'High'
  } else if (conf > 0.80) {
    return 'Moderate'
  } else if (conf > 0.70) {
    return 'Low'
  } else if (conf > 0.50) {
    return 'Very low'
  } else if (conf > 0.25) {
    return 'Extremely low'
  } else {
    return 'Completely garbage'
  }
}
export const getAppraisalForItemIDs = async (itemIDs) => {
  console.log('getAppraisalForItemIDs START', itemIDs.length)
  const appraisals = {}
  const missingAppraisalPromises = itemIDs.map(itemID => async (batchID) => {
    try {
      console.log('Processing', parseInt(batchID * 10), '-', parseInt(((batchID + 1) * 10) - 1), 'of', itemIDs.length, 'getAppraisalForItemIDs', itemID)
      const appraisal = await getAppraisalForItemID(itemID)
      appraisals[itemID] = appraisal
    } catch (error) {
      console.log('missingAppraisalPromises error', error)
    }
  })
  await runBatches(missingAppraisalPromises, 10)
  console.log('getAppraisalForItemIDs END')
  return appraisals
}
export const getAppraisalForItemID = async (itemID) => {
  try {
    const url = `https://mutaplasmid.space/api/modules/${itemID}/appraisal/`
    const req = await fetch(url)

    const res = await req.json()
    let confidence = predictionConfidence(res.confidence)
    if (res.error && res.error === 'No prediction available') {
      console.log('no prediction available')
      res.price = 'Unavailable'
      confidence = 'Unavailable'
    } else if (typeof res.price !== 'number' || isNaN(res.price)) {
      res.price = 'Error'
      confidence = 'Error'
    } else {
      res.price = Math.round(res.price)
    }
    return { type: 'AUTO', price: res.price, confidence }
  } catch (error) {
    console.log('getAppraisalForItem error', itemID, error)
    return { type: 'AUTO', price: 'Error', confidence: 'Error' }
  }
}
