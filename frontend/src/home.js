import { getDefaultItem } from './buy-search'
import { renderSearchCard } from './component/search-card'
import { calcValueForDisplay, formatForUnit } from './utils'
import sde from './generated-data/sde.json'

let type
let defaultItem
const bindSearchInteractions = () => {
  for (const searchAttrEle of [...document.querySelectorAll('.search-attr')]) {
    const id = parseInt(searchAttrEle.getAttribute('data-search-attr-id'))
    const attr = type.attributes.find(a => a.id === id)
    const displayValueEle = document.querySelector(`.search-attr-${attr.id}-display`)
    const rangeEle = document.querySelector(`.search-attr-${attr.id}-range`)
    const rangeDisplayEle = document.querySelector(`.search-attr-${attr.id}-range-display`)

    searchAttrEle.addEventListener('change', () => {
      attr.searchValue = parseFloat(searchAttrEle.value)
    //   triggerSearch()
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
        // triggerSearch()
      }
    })
  }
}
const setComparisonAttributes = () => {
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
export const renderHome = () => {
  type = sde.abyssalTypes[49730]
  defaultItem = getDefaultItem(type.typeID)
  setComparisonAttributes()
  console.log('type', type, defaultItem)
  const html = `
<section class="hero-section">
    <div class="container">
        <div class="row align-items-center">
            <div class="col-md-5">
                <div class="mt-md-4">
                    <!--
                    <div>
                        <span class="badge bg-light text-primary rounded-pill">o7</span>
                    </div>
                    -->
                    <h2 class="text-white fw-normal mb-4 mt-3 hero-title">
                        Buy and seller your EVE online abyssal modules easily
                    </h2>

                    <p class="fs-5 text-light">
                        The process is simple:
                    </p>
                    <ol class="text-light mb-4">
                        <li>Log in with EVE Single-Sign-On</li>
                        <li>Quickly and easiely select the abyss modules that you have in your inventory and list</li>
                        <li>Pay the 6m ISK listing fee and voila!</li>
                    </ol>

                    <a href="/buy" class="btn btn-success">Buy Modules</a>
                    <a href="/sell" class="btn btn-success">Sell Modules</a>
                </div>
            </div>
            <div class="col-md-3 offset-md-3">
                ${renderSearchCard(type, defaultItem)}
            </div>
        </div>
    </div>
</section>
<div class="angled-background">
    <div class="triangle"></div>
</div>
<section class="py-5">
    <div class="container">
        <div class="row py-4">
            <div class="col-lg-12">
                <div class="text-center">
                    <h1 class="mt-0"><i class="bi bi-infinity"></i></h1>
                    <h3>We're a group of experienced <span class="text-primary">abyssal sellers</span> with a huge reach and <span class="text-primary">community</span></h3>
                    <p class="text-muted mt-2">
                        We known what's hot and what's not. Think you've got something good?<br/>
                        List it here for a few ISK instead of getting lost in the abyss of contract listings
                    </p>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-lg-4">
                <div class="text-center p-3">
                    <div class="avatar-sm m-auto">
                        <span class="badge bg-primary rounded-pill">
                            <i class="bi bi-infinity fs-2"></i>
                        </span>
                    </div>
                    <h4 class="mt-3">Buy Modules</h4>
                    <p class="text-muted mt-2 mb-0">
                        Our search and filtering viewer shows how good a roll a module is, how it compares to every other base module and how god-like an item you have!
                    </p>
                </div>
            </div>

            <div class="col-lg-4">
                <div class="text-center p-3">
                    <div class="avatar-sm m-auto">
                        <span class="badge bg-primary rounded-pill">
                            <i class="bi bi-infinity fs-2"></i>
                        </span>
                    </div>
                    <h4 class="mt-3">Sell Modules</h4>
                    <p class="text-muted mt-2 mb-0">
                        Sick of setting up contracts manually? Spending so much time unsure of your module's marketing reach? Sell with us, we have connections
                    </p>
                </div>
            </div>

            <div class="col-lg-4">
                <div class="text-center p-3">
                    <div class="avatar-sm m-auto">
                        <span class="badge bg-primary rounded-pill">
                            <i class="bi bi-infinity fs-2"></i>
                        </span>
                    </div>
                    <h4 class="mt-3">Module Valuation <span class="badge bg-primary">Coming soon</span></h4>
                    <p class="text-muted mt-2 mb-0">
                        We'll be introducing an AI generated appraiser as well as appraisal service that guarantees at least 3 independent appraisals from our experienced team! Watch this space
                    </p>
                </div>
            </div>
        </div>

    </div>
</section>
`
  document.querySelector('.content').innerHTML = html
  for (const ele of [...document.querySelectorAll('.remove-on-home-page')]) {
    ele.remove()
  }
  document.querySelector('.results-text').innerHTML = `<a href="/buy/category/${type.typeID}" class="btn btn-primary"><i class="bi bi-search pe-2"></i> Search</a>`
  bindSearchInteractions()
}
