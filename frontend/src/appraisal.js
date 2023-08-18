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

export const getAppraisalForItemId = async (itemID, batchID) => {
  try {
    const urls = [
      `https://thingproxy.freeboard.io/fetch/https://mutaplasmid.space/api/modules/${itemID}/appraisal/`,
      `https://api.allorigins.win/raw?url=https://mutaplasmid.space/api/modules/${itemID}/appraisal/`,
      `https://corsproxy.io/?https://mutaplasmid.space/api/modules/${itemID}/appraisal/`
    ]
    // For now, just use mutaplasmid.space appraisal
    const url = urls[batchID % urls.length]
    const req = await fetch(url)

    const res = await req.json()
    // console.log('appraisal', itemID, batchID, url, res)
    // TODO - Cache appraisals in localstorage etc

    return { price: res.price, confidence: predictionConfidence(res.confidence) }
  } catch (error) {
    return { price: 'Unavailable', confidence: 'Unavailable' }
  }
}
