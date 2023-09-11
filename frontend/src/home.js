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
        // triggerSearch()
      }
    }
    searchAttrEle.addEventListener('mousedown', handleInputInteraction)
    searchAttrEle.addEventListener('touchstart', handleInputInteraction)
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
                        Buy and sell EVE online abyssal modules easily and cheaply
                    </h2>

                    

                    <p class="fs-5 text-light">
                        Why list with us? <b><span class="text-light">Max fees of 1%</span></b>
                    </p>

                    <p class="fs-6 text-light">
                      Listing through EVE Online contracts with perfect skills and standings will cost 1.5% - 2% plus any additional relist fees
                    </p>

                    <p class="fs-6 text-light">
                      Listing x10 abyssal modules worth 10b ISK each? Compare the costs:
                    </p>
                  
                    <div class="d-flex flex-row align-items-center text-light">
                        <div class="px-2"><i class="bi bi-emoji-angry-fill fs-4"></i></div>
                        <div class="p-2">EVE Online Contract: <span class="badge bg-secondary">1.5b ISK</span> PLUS relists</div>
                    </div>
                    <div class="d-flex flex-row align-items-center text-light">
                        <div class="px-2"><i class="bi bi-emoji-heart-eyes-fill fs-4"></i></div>
                        <div class="p-2">Abyss Board: <span class="badge bg-secondary">1b ISK</span> NO relists</div>
                    </div>
                    <div class="d-flex flex-row align-items-center text-light mb-3">
                        <div class="px-2"><i class="bi bi-piggy-bank-fill fs-4"></i></div>
                        <div class="p-2"><b><span class="badge bg-danger">+500m ISK</span> saving!</b></div>
                    </div>

                    <p class="fs-5 text-light">
                        The process is simple:
                    </p>
                    <div class="d-flex flex-row align-items-center text-light">
                        <div class="px-2"><i class="bi bi-1-circle-fill fs-4"></i></div>
                        <div class="p-2">Log in with EVE Single Sign-On</div>
                    </div>
                    <div class="d-flex flex-row align-items-center text-light">
                        <div class="px-2"><i class="bi bi-2-circle-fill fs-4"></i></div>
                        <div class="p-2">Select your abyss modules with a single click from your inventory</div>
                    </div>
                    <div class="d-flex flex-row mb-3 align-items-center text-light">
                        <div class="px-2"><i class="bi bi-3-circle-fill fs-4"></i></div>
                        <div class="p-2">Pay the minimal 1% ISK listing fee and voila!</div>
                    </div>


                    <div class="d-flex flex-row mb-3 align-items-center text-light">
                        <div class="p-2 w-100"><a href="/buy" class="btn btn-success mb-3 w-100">Buy Modules</a></div>
                        <div class="p-2 w-100"><a href="/sell" class="btn btn-success mb-3 w-100">Sell Modules</a></div>
                    </div>
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
                    <h3>We're a collective of experienced <span class="text-primary">abyssal sellers</span> with a huge reach and <span class="text-primary">community</span></h3>
                    <p class="text-muted mt-2">
                        We know what's in demand and what's not. Believe you have a valuable asset?<br/>
                        List it here for just a few ISK instead of getting lost in the abyss of contract listings
                    </p>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-lg-4">
                <div class="text-center p-3">
                    <div class="avatar-sm m-auto">
                        <span class="badge bg-primary rounded-pill">
                            <i class="bi bi-cart2 fs-2 p-2"></i>
                        </span>
                    </div>
                    <h4 class="mt-3">Buy Modules</h4>
                    <p class="text-muted mt-2 mb-0">
                      Our advanced search and filtering tool provides insights into the quality of a module's roll, its comparison to other base modules, and its rarity. Discover the god-like items you've been seeking!
                    </p>
                </div>
            </div>

            <div class="col-lg-4">
                <div class="text-center p-3">
                    <div class="avatar-sm m-auto">
                        <span class="badge bg-primary rounded-pill">
                            <i class="bi bi-cash-stack fs-2 p-2"></i>
                        </span>
                    </div>
                    <h4 class="mt-3">Sell Modules</h4>
                    <p class="text-muted mt-2 mb-0">
                        Tired of setting up contracts manually every few weeks? Spending so much time unsure of your module's market reach? Sell with us, and tap into our extensive connections and expertise
                    </p>
                </div>
            </div>

            <div class="col-lg-4">
                <div class="text-center p-3">
                    <div class="avatar-sm m-auto">
                        <span class="badge bg-primary rounded-pill">
                            <i class="bi bi-star fs-2 p-2"></i>
                        </span>
                    </div>
                    <h4 class="mt-3">Module Valuation <span class="badge bg-primary">Coming soon</span></h4>
                    <p class="text-muted mt-2 mb-0">
                      Stay tuned for our AI-generated appraiser and appraisal service, ensuring you receive at least 3 independent valuations from our experienced team. Watch this space for updates!
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
