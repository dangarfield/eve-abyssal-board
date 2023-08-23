// import sde from './frontend/src/generated-data/sde.json'
import fs from 'fs'
import MLR from 'ml-regression-multivariate-linear'

const sde = JSON.parse(fs.readFileSync('./frontend/src/generated-data/sde.json', 'utf-8'))

const normaliseValue = (value, min, max) => {
//   if (min === max) {
//     throw new Error('Min and max cannot be the same.')
//   }

  //   if (value < min || value > max) {
  //     throw new Error('Value is outside the range defined by min and max.')
  //   }

  return (value - min) / (max - min)
}

const generateModelForAbyssalType = async (type) => {
  console.log('generateModelForAbyssalType', type.name, type.attributeIds, type.sources)
  //   const x = Object.keys(type.sources).map(typeID => {
  //     return type.attributeIds.map(attrID => type.sources[typeID].attributes[attrID])
  //   })
  //   const y = await Promise.all(Object.keys(type.sources).map(async typeID => {
  //     const req = await fetch(`https://evetycoon.com/api/v1/market/stats/10000002/${typeID}`)
  //     const res = await req.json()
  //     return [res.sellAvgFivePercent]
  //   }))
  //   console.log('x', x, 'y', y)
  //   const mlr = new MLR(x, y)
  //   for (let i = 0; i < x.length; i++) {
  //     console.log('predict', x[i], y[i], '->', mlr.predict(x[i]))
  //   }

  //   const trainingData = await Promise.all(Object.keys(type.sources).map(async typeID => {
  //     const input = type.sources[typeID].attributes
  //     //     return type.attributeIds.map(attrID => type.sources[typeID].attributes[attrID])
  //     const req = await fetch(`https://evetycoon.com/api/v1/market/stats/10000002/${typeID}`)
  //     const res = await req.json()
  //     const output = { price: res.sellAvgFivePercent }
  //     return { input, output }
  //   }))

  const trainingData = await Promise.all(Object.keys(type.sources).map(async typeID => {
    const input = type.attributeIds.map(attrID => {
      const attr = type.attributes.find(a => a.id === attrID)
      const value = type.sources[typeID].attributes[attrID]
      const min = attr.allMin
      const max = attr.allMax
      const norm = normaliseValue(value, min, max)
      //   console.log('attrID', value, min, max, norm)
      return norm
    })
    const req = await fetch(`https://evetycoon.com/api/v1/market/stats/10000002/${typeID}`)
    const res = await req.json()
    const output = [res.sellAvgFivePercent / 1000000000]
    return { input, output }
  }))

  //   console.log('trainingData', JSON.stringify(trainingData))
  console.log('trainingData', JSON.stringify(trainingData))
  return trainingData
//   console.log('predict', mlr.predict([80000, 80, 1.065, 1.065, 0.935, 0.935]))
//   console.log('predict', mlr.predict([80000, 80, 1.065, 1.065, 0.935, 0.935]))
//   console.log('predict', mlr.predict([80000, 80, 1.065, 1.065, 0.935, 0.935]))
}

const init = async () => {
  console.log('sde', sde)

  const trainingData = {}
  for (const abyssalTypeIDString of Object.keys(sde.abyssalTypes)) {
    const abyssalTypeID = parseInt(abyssalTypeIDString)
    // console.log('abyssalTypeID', abyssalTypeID)
    // if (abyssalTypeID === 60483) {
    const itemTrainingData = await generateModelForAbyssalType(sde.abyssalTypes[abyssalTypeID])
    trainingData[abyssalTypeID] = itemTrainingData
    // }
  }
  fs.writeFileSync('./frontend/src/generated-data/appraisal-training.json', JSON.stringify(trainingData))
}
init()

// import brain from "brain.js";
// const net = new brain.NeuralNetwork();
// // Eg, from above
// const trainingData = [{"input":[0.35483871463930444,0.47058823900651764,0.24460375399520662,0.24460375399520662,0.21485642421910817,0.7648909198857439],"output":[0.06693]},{"input":[0.35483871463930444,0.3176470636084005,0.6328628941420863,0.6328628941420863,0.08963413437840052,0.3524176366338954],"output":[3.998]},{"input":[0.35483871463930444,0.282352946208835,0.6716888081567742,0.6716888081567742,0.07711190539432969,0.3111703083087104],"output":[4.981]},{"input":[0.35483871463930444,0.21176471140970404,0.7105147221714623,0.7105147221714623,0.06458967641025887,0.2699229799835253],"output":[6.393]},{"input":[0.35483871463930444,0.17647059401013857,0.7493406361861502,0.7493406361861502,0.052067447426188025,0.22867565165834022],"output":[14.65]},{"input":[0.1935483932991305,0.29411765200869017,0.3416685390319244,0.3416685390319244,0.18355085175893107,0.6617725990727812],"output":[0.08197]},{"input":[0.5161290359794783,0.47058823900651764,0.43873332406864646,0.43873332406864646,0.152245279298754,0.5586542782598185],"output":[0.139]},{"input":[0.40860215508602904,0.5294117680057935,0.5357981091053642,0.5357981091053642,0.1209397068385776,0.4555359574468581],"output":[1.775]}]

// net.train(trainingData, { activation: "leaky-relu" });

// for (let i = 0; i < trainingData.length; i++) {
//   const actual = trainingData[i].output * 1000000000
//   const predicted = net.run(trainingData[i].input) * 1000000000
//   const percentageDifference = 100 - (((predicted - actual) / actual) * 100)
//   console.log(i, actual, "->", predicted, '=', `${percentageDifference.toFixed(0)}%`);
// }
// const jsonModel = net.toJSON();
