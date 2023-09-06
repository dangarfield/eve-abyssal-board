// import trainingData from './generated-data/appraisal-training.json'
// import sde from './generated-data/sde.json'
// const brain = window.brain

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
// const normaliseValue = (value, min, max) => {
//   //   if (min === max) {
//   //     throw new Error('Min and max cannot be the same.')
//   //   }

//   //   if (value < min || value > max) {
//   //     throw new Error('Value is outside the range defined by min and max.')
//   //   }

//   return (value - min) / (max - min)
// }
export const getAppraisalForItem = async (item, batchID) => {
  try {
    const urls = [
      `https://thingproxy.freeboard.io/fetch/https://mutaplasmid.space/api/modules/${item.itemID}/appraisal/`,
      `https://api.allorigins.win/raw?url=https://mutaplasmid.space/api/modules/${item.itemID}/appraisal/`,
      `https://corsproxy.io/?https://mutaplasmid.space/api/modules/${item.itemID}/appraisal/`
    ]
    // For now, just use mutaplasmid.space appraisal
    const url = urls[batchID % urls.length]
    const req = await fetch(url)

    const res = await req.json()
    // console.log('appraisal', item, batchID, url, res)
    // TODO - Cache appraisals in localstorage etc

    // console.log('trainingData', trainingData[item.typeID])
    // const net = new brain.NeuralNetwork() // Should really load this in once per type
    // console.log('training')
    // net.train(trainingData[item.typeID], { activation: 'leaky-relu' })
    // console.log('ready')
    // const type = sde.abyssalTypes[item.typeID]
    // console.log('type', type)
    // const input = type.attributeIds.map(attrID => {
    //   const attr = type.attributes.find(a => a.id === attrID)
    //   const value = item.attributesRaw[attrID]
    //   const min = attr.allMin
    //   const max = attr.allMax
    //   const norm = normaliseValue(value, min, max)
    //   console.log('attrID', value, min, max, norm)
    //   return norm
    // })
    // console.log('input', input)
    // let predictedPrice = Math.abs(Math.round(net.run(input) * 1000000000))
    // if (isNaN(predictedPrice)) predictedPrice = 0
    // console.log('predictedPrice', predictedPrice) // This is incredibly inaccurate. Wait until we have more appraisal data increases then retrain, I'll leave the code here

    let confidence = predictionConfidence(res.confidence)
    console.log('res.price', res)
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
    console.log('getAppraisalForItem error', item, error)
    return { type: 'AUTO', price: 'Error', confidence: 'Error' }
  }
}
