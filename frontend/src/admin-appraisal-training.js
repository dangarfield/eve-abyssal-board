import sde from './generated-data/sde.json'

const generateModelForAbyssalType = async (type) => {
  console.log('generateModelForAbyssalType', type.name, type.attributeIds, type.sources)
  const trainingData = await Promise.all(Object.keys(type.sources).map(async (typeID) => {
    const input = type.sources[typeID].attributes // TODO - Normalise
    const req = await fetch(`https://evetycoon.com/api/v1/market/stats/10000002/${typeID}`)
    const res = await req.json()
    const output = { price: res.sellAvgFivePercent }
    return { input, output }
  }))
  console.log('trainingData', trainingData)
}

export const generateAppraisalModels = async () => {
  console.log('sde', sde)

  for (const abyssalTypeIDString of Object.keys(sde.abyssalTypes)) {
    const abyssalTypeID = parseInt(abyssalTypeIDString)
    console.log('abyssalTypeID', abyssalTypeID)
    if (abyssalTypeID === 60483) {
      await generateModelForAbyssalType(sde.abyssalTypes[abyssalTypeID])
    }
  }
}
