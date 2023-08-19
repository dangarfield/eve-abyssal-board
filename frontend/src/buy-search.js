import sde from './generated-data/sde.json'
import { renderSearchCard } from './component/search-card'
import { formatForUnit } from './utils'
import { searchForModulesOfType } from './board-api'
import { renderInventoryCard } from './component/inventory-card'
import { inventoryToInventoryCardDTO } from './dogma-utils'

let type
let allResults

const renderSearchPlaceholder = () => {
  const placeholderResultHtml = Array.from({ length: 7 }).map(a => `
    <div class="col-3 result mb-4">
        <div class="card" aria-hidden="true">
            <div class="card-body">
            ${Array.from({ length: 5 }).map(b => `
                <h5 class="card-title placeholder-glow">
                <span class="placeholder col-6"></span>
                </h5>
                <p class="card-text placeholder-glow">
                <span class="placeholder col-7"></span>
                <span class="placeholder col-4"></span>
                <span class="placeholder col-4"></span>
                <span class="placeholder col-6"></span>
                <span class="placeholder col-8"></span>
                </p>
            `).join('')}
            </div>
        </div>
    </div>`).join('')
  const html = `
    <div class="container">
        <div class="row">
            <div class="col text-center my-2">
                <h1>${type.name}</h1>
            </div>
        </div>
        <div class="row search-results">
            <div class="col-3 mb-4 search-card-holder">
                ${renderSearchCard(type)}
            </div>
            ${placeholderResultHtml}
        </div>
    </div>`
  document.querySelector('.content').innerHTML = html
}
const bindSearchInteractions = () => {
  document.querySelector('.search-source').addEventListener('change', (event) => {
    const value = parseInt(event.target.value)
    // console.log('value', value)
    if (value === 0) {
      document.querySelector('.search-source-img').style.opacity = 0
    } else {
      document.querySelector('.search-source-img').setAttribute('src', `https://images.evetech.net/types/${value}/icon?size=32`)
      document.querySelector('.search-source-img').style.opacity = 1
    }
    triggerSearch()
  })

  for (const searchAttrEle of [...document.querySelectorAll('.search-attr')]) {
    const id = parseInt(searchAttrEle.getAttribute('data-search-attr-id'))
    const attr = type.attributes.find(a => a.id === id)
    const displayValueEle = document.querySelector(`.search-attr-${attr.id}-display`)
    const rangeEle = document.querySelector(`.search-attr-${attr.id}-range`)
    const rangeDisplayEle = document.querySelector(`.search-attr-${attr.id}-range-display`)

    searchAttrEle.addEventListener('change', () => {
      attr.searchValue = parseFloat(searchAttrEle.value)
      triggerSearch()
    })
    searchAttrEle.addEventListener('input', () => {
      const value = parseFloat(searchAttrEle.value)
      const displayValue = formatForUnit(value, attr.unitID)

      const percentage = (100 * ((value - attr.allMin) / (attr.allMax - attr.allMin))) - attr.range
      //   console.log('searchAttrEle VALUE', attr.name, attr.id, value, displayValue, percentage)
      displayValueEle.innerHTML = displayValue
      rangeEle.style.left = `${percentage}%`
    })

    searchAttrEle.addEventListener('mousedown', event => {
      const sliderRect = searchAttrEle.getBoundingClientRect()
      const sliderWidth = sliderRect.width
      const offsetX = event.clientX - sliderRect.left

      const min = parseFloat(searchAttrEle.min)
      const max = parseFloat(searchAttrEle.max)
      const value = parseFloat(searchAttrEle.value)

      const thumbPosition = (value - min) / (max - min) * sliderWidth

      if (Math.abs(offsetX - thumbPosition) <= 10) {
        // console.log('Mousedown on the thumb', value)
      } else {
        event.preventDefault()

        const thumbPerc = (value - min) / (max - min)
        const perc = offsetX / sliderWidth
        const diff = Math.abs(perc - thumbPerc)
        // console.log('Mousedown on the track', value, thumbPosition, sliderWidth, thumbPerc, perc, diff)
        attr.range = diff * 100
        rangeEle.style.width = `${diff * 200}%`
        rangeEle.style.left = `${(thumbPerc * 100) - (diff * 100)}%`
        rangeDisplayEle.innerHTML = `± ${formatForUnit(((attr.allMax - attr.allMin) / 100) * attr.range, attr.unitID)}`
        triggerSearch()
      }
    })
  }
}
const updateResultsText = (text) => {
  document.querySelector('.results-text').innerHTML = text
}
const addQualityScoreToItem = (results) => {
  // TODO - These are not weighted at all
  for (const result of results) {
    const qualityList = []
    for (const attr of result.attributes) {
      if (attr.allPerc !== undefined) {
        const q = attr.allIsGood ? attr.allPerc : -attr.allPerc
        qualityList.push(q)
        // console.log('quality', result.itemID, attr.name, q)
      } else {
        const q = attr.isGood ? attr.perc : -attr.perc
        qualityList.push(q)
        // console.log('quality', result.itemID, attr.name, q)
      }
    }
    const qualityScore = qualityList.reduce((sum, num) => sum + num, 0) / qualityList.length
    // console.log('qualityList', result.itemID, qualityList, qualityScore)
    result.qualityScore = qualityScore
  }
}
const getInitialSearch = async () => {
  allResults = (await searchForModulesOfType(type.typeID, {})).map(r => inventoryToInventoryCardDTO(r))
  addQualityScoreToItem(allResults)
}

const filterResults = (mainObjects, filteringObjects) => {
  return filteringObjects.reduce((filteredObjects, filteringObject) => {
    const { id, min, max } = filteringObject

    return filteredObjects.filter(mainObj => {
      const attributeValue = mainObj.attributesRaw[id]
      //   console.log('attributeValue', mainObj.itemID, id, attributeValue, '-', min, max, attributeValue >= min && attributeValue <= max)
      return attributeValue !== undefined && attributeValue >= min && attributeValue <= max
    })
  }, mainObjects)
}

const triggerSearch = async () => {
//   console.log('allResults', allResults)
  updateResultsText('Waiting for results to load')

  const query = { attributes: [] }
  const sourceValue = parseInt(document.querySelector('.search-source').value)
  //   if (sourceValue > 0) query.source = sourceValue

  for (const attr of type.attributes) {
    const mid = attr.searchValue
    const range = attr.range
    const rangeValue = (attr.allMax - attr.allMin) / 100 * range
    const min = mid - rangeValue
    const max = mid + rangeValue
    // console.log('attr', attr.id, '-', mid, range, '=', min, max)
    query.attributes.push({ id: attr.id, min, max })
  }

  let results = filterResults(allResults, query.attributes)
  if (sourceValue > 0) results = results.filter(r => r.sourceTypeID === sourceValue)

  results.sort((a, b) => b.qualityScore - a.qualityScore) // TODO - Add different sort options

  console.log('triggerSearch', query, results)

  //   const results = await searchForModulesOfType(type.typeID, query)
  updateResultsText(`<b>${results.length}</b> of <b>${allResults.length}</b> listed module${results.length === 1 ? '' : 's'}`)
  //   console.log('results', results)

  //   // Remove results
  document.querySelectorAll('.search-results .result').forEach(element => {
    element.remove()
  })
  const searchResults = document.querySelector('.search-results')
  let resultHtml = results.map(r => {
    return `<div class="col-3 mb-4 result">${renderInventoryCard(r)}</div>`
  }).join('')

  if (results.length === 0) {
    resultHtml = '<div class="col-9 mt-5 mb-4 result text-center"><h3>No results, please use the filter to find more modules for sale</h3></div>'
  }
  //   const htmlToAppend = '<div class="col-3">New Element 1</div><div class="col-3">New Element 2</div>'
  searchResults.insertAdjacentHTML('beforeend', resultHtml)
}
export const displayTypeSearch = async (typeID) => {
  type = sde.abyssalTypes[typeID]
  console.log('type', type)
  if (type === undefined) window.location.assign('/buy')
  for (const attr of type.attributes) {
    attr.range = 20
    attr.searchValue = ((attr.allMax - attr.allMin) / 2) + attr.allMin
    // console.log(attr.searchValue)
  }
  type.attributes.sort((a, b) => {
    const typeOrder = ['mutation', 'base-module', 'derived']
    if (typeOrder.indexOf(a.type) < typeOrder.indexOf(b.type)) {
      return -1
    } else if (typeOrder.indexOf(a.type) > typeOrder.indexOf(b.type)) {
      return 1
    } else {
      return a.name.localeCompare(b.name)
    }
  })
  console.log('sorted types', type.attributes.map(a => a.name))
  renderSearchPlaceholder()
  await getInitialSearch()
  bindSearchInteractions()
  triggerSearch()
}
