import sde from './generated-data/sde.json'
import { renderSearchCard } from './component/search-card'
import { calcValueForDisplay, formatForUnit, formatToISKString, showModalAlert } from './utils'
import { getAppConfig, searchForModulesOfType } from './board-api'
import { renderInventoryCard } from './component/inventory-card'
import { inventoryToInventoryCardDTO } from './dogma-utils'
import { getAbyssModuleTypes } from './module-types'
import { getCurrentUserDetails } from './auth'
import { openBuyerToSellerDraftEVEMail, openContractInEVEOnline } from './esi-api'
import { range } from 'mathjs'

let type
let allResults
let defaultItem

const moduleTypes = getAbyssModuleTypes()

const DEFAULT_RANGE = 10
const renderSearchPlaceholder = (showContracts) => {
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
        <div class="row">
          <div class="col">
            <div class="card legend">
              <div class="card-body pb-0">
                <h5 class="card-title">Legend</h5>
                <p>
                  <span style="width:50px;display:inline-block; margin:0;padding:0;">
                    <span class="progress justify-content-end" role="progressbar">
                      <span class="progress-bar progress-bar-striped progress-bar-animated bg-danger" style="width: 30%"></span>
                    </span>
                  </span><span style="width:50px;display:inline-block; margin:0;padding:0;">
                    <span class="progress justify-content-start" role="progressbar">
                      <span class="progress-bar progress-bar-striped progress-bar-animated-reverse bg-success" style="width: 80%"></span>
                    </span>
                  </span>
                  <b class="text-primary">Compare roll</b> - As in game, the quality of the roll. But you should only compare green and red rolls of the same source and mutaplasmid
                </p>
                <p>
                  <span style="width:50px;display:inline-block; margin:0;padding:0;">
                    <span class="progress short justify-content-end" role="progressbar">
                      <span class="progress-bar progress-bar-striped progress-bar-animated bg-warning" style="width: 40%"></span>
                    </span>
                  </span><span style="width:50px;display:inline-block; margin:0;padding:0;">
                    <span class="progress short justify-content-start" role="progressbar">
                      <span class="progress-bar progress-bar-striped progress-bar-animated-reverse bg-primary" style="width: 50%"></span>
                    </span>
                  </span>
                  <b class="text-primary">Compare across sources</b> - Full blue = best possible roll from best possible source & muta. A green T2 may still provide a lower actual value that a red officer</p>
                <p>
                  <span class="badge bg-primary"><i class="bi bi-hand-thumbs-up-fill"></i> 31%</span>
                  <span class="badge bg-danger"><i class="bi bi-hand-thumbs-down-fill"></i> -22%</span>
                  <b class="text-primary">How god-like</b> - 100% = full blue on every attribute = maximum roll on the source with the best base attribute</p>
              </div>
            </div>
          </div>
        </div>
        <div class="row search-results">
            <div class="col-lg-3 mb-4 search-card-holder">
                ${renderSearchCard(type, defaultItem, showContracts)}
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
    const attributeActiveEle = document.querySelector(`.attribute-active.attr-${attr.id}`)
    const attributeHolderEle = document.querySelector(`.attribute-holder.attr-${attr.id}`)
    attributeActiveEle.addEventListener('change', (e) => {
      console.log('attributeActiveEle', id, attributeActiveEle.checked)
      if (attributeActiveEle.checked) {
        attributeHolderEle.classList.remove('attribute-inactive')
        searchAttrEle.parentElement.classList.remove('attribute-inactive')
        searchAttrEle.removeAttribute('disabled')
        delete attr.disabled
      } else {
        attributeHolderEle.classList.add('attribute-inactive')
        searchAttrEle.parentElement.classList.add('attribute-inactive')
        searchAttrEle.setAttribute('disabled', 'disabled')
        attr.disabled = true
      }
      triggerSearch()
    })
    searchAttrEle.addEventListener('change', () => {
      attr.searchValue = parseFloat(searchAttrEle.value)
      triggerSearch()
    })
    searchAttrEle.addEventListener('input', () => {
      const value = parseFloat(searchAttrEle.value)
      const displayValue = formatForUnit(calcValueForDisplay(value, attr.unitID), attr.unitID)
      const percentage = (100 * ((value - attr.allMin) / (attr.allMax - attr.allMin))) - attr.range
      console.log('searchAttrEle VALUE', attr.name, attr.id, value, displayValue, percentage, attr.range)

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
    console.log('searchAttrEle VALUE', attr.name, attr.id, searchAttrEle.value, percentage, attr.range)
    if (attr.highIsGood) {
      rangeEle.style.right = 'inherit'
      rangeEle.style.left = `${percentage}%`
    } else {
      rangeEle.style.left = 'inherit'
      rangeEle.style.right = `${percentage}%`
    }
    rangeEle.style.width = `${attr.range * 2}%`
    rangeEle.style.display = 'block'

    const handleInputInteraction = (event) => {
      console.log('handleInputInteraction', event)
      const sliderRect = searchAttrEle.getBoundingClientRect()
      const sliderWidth = sliderRect.width
      const clientX = event.clientX ? event.clientX : event.touches[0].clientX
      let offsetX = clientX - sliderRect.left
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
    }
    searchAttrEle.addEventListener('mousedown', handleInputInteraction)
    searchAttrEle.addEventListener('touchstart', handleInputInteraction)
  }
}
const createSimilarLink = (result) => {
  const params = Object.entries(result.attributesRaw).map(([attrID, value]) => {
    return `${attrID}=${value.toFixed(4)}_${DEFAULT_RANGE}`
    /*
    https://mutaplasmid.space/type/47745/contracts/
      ?10147=95.0
      & 30 = 1336.5000155568123
      & 20 = 528.1776029033662
      & 6 = 306.43200080871577
      & 50 = 65.72250079661607
      & 554 = 335.7079922091961
      & percent_range = 0.15
    */
  })
  const link = `/buy/category/${type.typeID}?${params.join('&')}&contracts`
  console.log('createSimilarLink', result, params)
  return link
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

export const bindInventoryCardClickForContact = async (resultCard, results) => {
  const mutaplasmidSpaceText = `<p>View this mod on <a href="https://mutaplasmid.space/module/${resultCard.querySelector('.inventory-item').getAttribute('data-item-id')}/" target="_blank">mutaplasmid.space</a></p>`
  const itemID = parseInt(resultCard.querySelector('.inventory-item').getAttribute('data-item-id'))
  const result = results.find(r => r.itemID === itemID)
  console.log('result', result)
  const currentUserDetails = getCurrentUserDetails()
  console.log('currentUserDetails', currentUserDetails)
  const appConfig = await getAppConfig()
  console.log('getAppConfig', appConfig)
  const similarLink = createSimilarLink(result)
  const similarLinkAction = {
    buttonText: 'View similar',
    style: 'btn-primary',
    cb: async () => {
      console.log('View similar')
      window.location.assign(similarLink)
    }
  }
  console.log('similarLink', similarLink)
  if (result.status) {
    const discordText = result.discordName ? `<p>This seller is known on the <a href="${appConfig.discordUrl}" target="_blank">Abyssal Trade Discord Board</a> as <code>${result.discordName}</code></p>` : ''
    const inGameText = currentUserDetails ? '<p>Click below to open an EVE mail to communicate with the seller</p>' : '<p>If you login we can help by creating an EVE mail draft with a link to the seller and item</p>'
    const actions = [similarLinkAction]
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
      ${mutaplasmidSpaceText}
      `
    showModalAlert('Interested?', content, actions)
  } else {
    const content = (currentUserDetails ? '<p>Click below to view this contract in EVE online</p>' : '<p>If you login we can help by opening the contract directly in EVE online</p>') + mutaplasmidSpaceText
    const actions = [similarLinkAction]
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

    if (!attr.disabled) {
      // console.log('attr', attr.id, '-', mid, range, '=', min, max, attr.disabled)
      query.attributes.push({ id: attr.id, min, max })
    }
  }

  let results = filterResults(allResults, query.attributes)
  for (const result of results) {
    if (result.appraisal === undefined) result.appraisal = [{ type: 'AUTO', price: 'Unavailable', confidence: 'Unavailable' }]
  }
  if (sourceValue > 0) results = results.filter(r => r.sourceTypeID === sourceValue)
  if (!showContracts) results = results.filter(r => r.status)
  results.sort((a, b) => (a.premium === b.premium ? 0 : a.premium ? -1 : 1) || b.qualityScore - a.qualityScore) // TODO - Add different sort options

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
      bindInventoryCardClickForContact(resultCard, allResults)
    })
  }
}
export const getDefaultItem = (typeID) => {
  const itemID = moduleTypes.flatMap(group => group.categories).find(category => category.typeID === typeID)?.defaultItem || null
  if (itemID === null) return null
  return sde.abyssalTypes[typeID].sources[itemID]
}
const getFiltersFromURL = () => {
  const params = new URLSearchParams(window.location.search)
  console.log('params', params, params.size)
  if (params.size === 0) return null
  const paramsObject = {}
  for (const [attrID, value] of params) {
    if (value.includes('_')) {
      const valueSplit = value.split('_')
      paramsObject[attrID] = { searchValue: parseFloat(valueSplit[0]), range: parseFloat(valueSplit[1]) }
    } else {
      paramsObject[attrID] = { searchValue: parseFloat(value) }
    }
  }
  if (params.has('percent_range')) {
    paramsObject.range = Math.round(parseFloat(params.get('percent_range')) * 100)
  }
  if (params.has('contracts')) {
    paramsObject.contracts = true
  }
  console.log('paramsObject', paramsObject)
  return paramsObject
}
export const setComparisonAttributes = () => {
  const urlFilters = getFiltersFromURL()

  for (const attr of type.attributes) {
    attr.range = 20
    if (urlFilters) {
      if (urlFilters.range) {
        attr.range = urlFilters.range
      }
      const urlAttr = urlFilters[attr.id]
      attr.searchValue = urlAttr.searchValue
      if (urlAttr.range) {
        attr.range = urlAttr.range
      }
    } else if (defaultItem) {
      attr.searchValue = defaultItem.attributes[attr.id]
    } else {
      attr.searchValue = ((attr.allMax - attr.allMin) / 2) + attr.allMin
    }
    console.log('searchValue', attr.name, attr.searchValue, 'min', attr.allMin, 'max', attr.allMax, attr)
  }
  return urlFilters?.contracts
}
export const displayTypeSearch = async (typeID) => {
  type = sde.abyssalTypes[typeID]
  console.log('type', type)
  if (type === undefined) window.location.assign('/buy')
  defaultItem = getDefaultItem(parseInt(typeID))
  console.log('defaultItem', defaultItem)
  const showContracts = setComparisonAttributes()
  console.log('showContracts', showContracts)
  type.attributes.sort((a, b) => {
    const typeOrder = ['mutation', 'base-module', 'derived']
    if (typeOrder.indexOf(a.type) < typeOrder.indexOf(b.type)) {
      return -1
    } else if (typeOrder.indexOf(a.type) > typeOrder.indexOf(b.type)) {
      return 1
    } else if (type.group === 'Cap Batteries') { // CPU usage is displayed in consistently
      return a.id === 50 ? -1 : b.id === 50 ? 1 : a.name.localeCompare(b.name)
    } else {
      return a.name.localeCompare(b.name)
    }
  })
  console.log('sorted types', type.attributes.map(a => a.name))
  renderSearchPlaceholder(showContracts)
  await getInitialSearch()
  bindSearchInteractions()
  triggerSearch()
}
