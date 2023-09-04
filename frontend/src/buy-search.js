import sde from './generated-data/sde.json'
import { renderSearchCard } from './component/search-card'
import { calcValueForDisplay, formatForUnit, formatToISKString, showModalAlert } from './utils'
import { getAppConfig, searchForModulesOfType } from './board-api'
import { renderInventoryCard } from './component/inventory-card'
import { inventoryToInventoryCardDTO } from './dogma-utils'
import { getAbyssModuleTypes } from './module-types'
import { getCurrentUserDetails } from './auth'
import { openBuyerToSellerDraftEVEMail, openContractInEVEOnline } from './esi-api'

let type
let allResults
let defaultItem

const moduleTypes = getAbyssModuleTypes()

const renderSearchPlaceholder = () => {
  const placeholderResultHtml = Array.from({ length: 7 }).map(a => `
    <div class="col-lg-3 item mb-4">
        <div class="card" aria-hidden="true">
            <div class="card-body">
            ${Array.from({ length: 5 }).map(b => `
                <h5 class="card-title placeholder-glow">
                <span class="placeholder col-lg-6"></span>
                </h5>
                <p class="card-text placeholder-glow">
                <span class="placeholder col-lg-7"></span>
                <span class="placeholder col-lg-4"></span>
                <span class="placeholder col-lg-4"></span>
                <span class="placeholder col-lg-6"></span>
                <span class="placeholder col-lg-8"></span>
                </p>
            `).join('')}
            </div>
        </div>
    </div>`).join('')
  const html = `
    <div class="container">
        <div class="row">
            <div class="col my-5 pagetitle">
                <h2>${type.name}</h2>
            </div>
        </div>
        <div class="row search-results">
            <div class="col-lg-3 mb-4 search-card-holder">
                ${renderSearchCard(type, defaultItem)}
            </div>
            ${placeholderResultHtml}
        </div>
    </div>`
  document.querySelector('.content').innerHTML = html
}
const bindSearchInteractions = () => {
  document.querySelector('.compare-source').addEventListener('change', (event) => {
    const value = parseInt(event.target.value)
    // const itemID = moduleTypes.flatMap(group => group.categories).find(category => category.typeID === type.typeID)?.defaultItem || null
    // if (itemID === null) {
    //   defaultItem = null
    // } else {
    defaultItem = sde.abyssalTypes[type.typeID].sources[value]
    // }
    // console.log('compare-source', value, defaultItem)
    if (defaultItem) console.log(`defaultItem: ${value} // ${defaultItem.name}`)
    setComparisonAttributes()
    document.querySelector('.search-card-holder').innerHTML = renderSearchCard(type, defaultItem)
    bindSearchInteractions()
    triggerSearch()
  })
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
  document.querySelector('.show-contracts').addEventListener('change', (event) => {
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
      const displayValue = formatForUnit(calcValueForDisplay(value, attr.unitID), attr.unitID)
      const percentage = (100 * ((value - attr.allMin) / (attr.allMax - attr.allMin))) - attr.range
      //   console.log('searchAttrEle VALUE', attr.name, attr.id, value, displayValue, percentage)

      displayValueEle.innerHTML = displayValue
      if (attr.highIsGood) {
        rangeEle.style.right = 'inherit'
        rangeEle.style.left = `${percentage}%`
      } else {
        rangeEle.style.left = 'inherit'
        rangeEle.style.right = `${percentage}%`
      }
    })
    const percentage = (100 * ((searchAttrEle.value - attr.allMin) / (attr.allMax - attr.allMin))) - attr.range
    if (attr.highIsGood) {
      rangeEle.style.right = 'inherit'
      rangeEle.style.left = `${percentage}%`
    } else {
      rangeEle.style.left = 'inherit'
      rangeEle.style.right = `${percentage}%`
    }
    rangeEle.style.display = 'block'
    searchAttrEle.addEventListener('mousedown', event => {
      const sliderRect = searchAttrEle.getBoundingClientRect()
      const sliderWidth = sliderRect.width
      let offsetX = event.clientX - sliderRect.left
      if (!attr.highIsGood) offsetX = sliderWidth - offsetX
      const min = parseFloat(searchAttrEle.min)
      const max = parseFloat(searchAttrEle.max)
      const value = parseFloat(searchAttrEle.value)

      const thumbPosition = (value - min) / (max - min) * sliderWidth

      console.log('mousedown', offsetX, thumbPosition, sliderWidth)
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

        const totalPerc = (thumbPerc * 100) - (diff * 100)
        if (attr.highIsGood) {
          rangeEle.style.right = 'inherit'
          rangeEle.style.left = `${totalPerc}%`
        } else {
          rangeEle.style.left = 'inherit'
          rangeEle.style.right = `${totalPerc}%`
        }

        const plusMinusValue = ((calcValueForDisplay(attr.allMax, attr.unitID) - calcValueForDisplay(attr.allMin, attr.unitID)) / 100) * attr.range
        const plusMinusDisplayValue = formatForUnit(plusMinusValue, attr.unitID)
        rangeDisplayEle.innerHTML = `± ${plusMinusDisplayValue}`
        triggerSearch()
      }
    })
  }
}
const updateResultsText = (text) => {
  document.querySelector('.results-text').innerHTML = text
}

const getInitialSearch = async () => {
  allResults = (await searchForModulesOfType(type.typeID, {})).map(r => inventoryToInventoryCardDTO(r))
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
  const showContracts = document.querySelector('.show-contracts').checked
  console.log('showContracts', showContracts, allResults)
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
  if (!showContracts) results = results.filter(r => r.status !== 'CONTRACT')
  results.sort((a, b) => b.qualityScore - a.qualityScore) // TODO - Add different sort options

  console.log('triggerSearch', query, results)

  //   const results = await searchForModulesOfType(type.typeID, query)
  updateResultsText(`<b>${results.length}</b> of <b>${allResults.length}</b> module${results.length === 1 ? '' : 's'}`)
  //   console.log('results', results)

  //   // Remove results
  document.querySelectorAll('.search-results .item').forEach(element => {
    element.remove()
  })
  const searchResults = document.querySelector('.search-results')
  let resultHtml = results.map(r => {
    return `<div class="col-lg-3 mb-4 item result">${renderInventoryCard(r)}</div>`
  }).join('')

  if (results.length === 0) {
    resultHtml = '<div class="col-lg-9 mt-5 mb-4 item text-center"><h3>No results, please use the filter to find more modules for sale</h3></div>'
  }
  searchResults.insertAdjacentHTML('beforeend', resultHtml)

  for (const resultCard of [...document.querySelectorAll('.search-results .result')]) {
    resultCard.addEventListener('click', async () => {
      const itemID = parseInt(resultCard.querySelector('.inventory-item').getAttribute('data-item-id'))
      const result = allResults.find(r => r.itemID === itemID)
      console.log('result', result)
      const currentUserDetails = getCurrentUserDetails()
      console.log('currentUserDetails', currentUserDetails)
      const appConfig = await getAppConfig()
      console.log('getAppConfig', appConfig)
      if (result.status !== 'CONTRACT') {
        const discordText = result.discordName ? `<p>This seller is known on the <a href="${appConfig.discordUrl}" target="_blank">Abyssal Trade Discord Board</a> as <code>${result.discordName}</code></p>` : ''
        const inGameText = currentUserDetails ? '<p>Click below to open an EVE mail to communicate with the seller</p>' : '<p>If you login we can help by creating an EVE mail draft with a link to the seller and item</p>'
        const actions = []
        if (currentUserDetails) {
          actions.push({
            buttonText: 'Create EVE mail draft',
            style: 'btn-primary',
            cb: async () => {
              console.log('callback')
              await openBuyerToSellerDraftEVEMail(result.typeID, result.itemID, result.typeName, formatToISKString(result.listingPrice), result.characterName, result.characterId)
              console.log('opened')
              document.querySelector('.btn-close').click()
            }
          })
        }
        const content = `
          <p>Contact the seller in EVE Online: <code>${result.characterName}</code></p>
          ${discordText}
          ${inGameText}
          `
        showModalAlert('Interested?', content, actions)
      } else {
        const content = currentUserDetails ? '<p>Click below to view this contract in EVE online</p>' : '<p>If you login we can help by opening the contract directly in EVE online</p>'
        const actions = []
        if (currentUserDetails) {
          actions.push({
            buttonText: 'Open contract',
            style: 'btn-primary',
            cb: async () => {
              console.log('callback')
              await openContractInEVEOnline(result.contract.id)
              console.log('opened')
              document.querySelector('.btn-close').click()
            }
          })
        }
        showModalAlert('Interested?', content, actions)
      }
    })
  }
}
export const getDefaultItem = (typeID) => {
  const itemID = moduleTypes.flatMap(group => group.categories).find(category => category.typeID === typeID)?.defaultItem || null
  if (itemID === null) return null
  return sde.abyssalTypes[typeID].sources[itemID]
}
export const setComparisonAttributes = () => {
  for (const attr of type.attributes) {
    attr.range = 20
    if (defaultItem) {
      attr.searchValue = defaultItem.attributes[attr.id]
    } else {
      attr.searchValue = ((attr.allMax - attr.allMin) / 2) + attr.allMin
    }
    // console.log('searchValue', defaultItem, attr.id, attr.searchValue)
  }
}
export const displayTypeSearch = async (typeID) => {
  type = sde.abyssalTypes[typeID]
  console.log('type', type)
  if (type === undefined) window.location.assign('/buy')
  defaultItem = getDefaultItem(parseInt(typeID))
  console.log('defaultItem', defaultItem)
  setComparisonAttributes()
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
