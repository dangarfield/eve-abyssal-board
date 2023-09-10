import { getStoreData } from './board-api'
import { bindInventoryCardClickForContact } from './buy-search'
import { renderInventoryCard } from './component/inventory-card'
import { inventoryToInventoryCardDTO } from './dogma-utils'
import { render404 } from './utils'

const renderStorePlaceholder = () => {
  const placeholderResultHtml = Array.from({ length: 8 }).map(a => `
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
  <div class="container-fluid gx-0">
    <div class="row">
        <div class="col placeholder-glow">
            <span class="placeholder col-lg-12" style="height:300px;"></span>
        </div>=-
    </div>
  </div>
  <div class="container">
    <div class="row mt-4">
        <div class="col placeholder-glow">
            <span class="placeholder col-lg-3"></span>
            <span class="placeholder col-lg-6"></span>
            <span class="placeholder col-lg-2"></span>
        </div>
    </div>
    <div class="row mt-4">
        ${placeholderResultHtml}
    </div>
  </div>
  `

  document.querySelector('.content').innerHTML = html
}
const renderStore = async (storeData) => {
  const headingHTML =
  `
  <div class="container-fluid gx-0">
    <div class="p-4 p-md-5 mb-4 ${storeData.storefront.blackText ? 'text-body' : 'text-white'}" style="background:${storeData.storefront.color};">
        <div class="col-lg-12 px-0">
            <h1 class="display-4 fst-italics">${storeData.storefront.name}</h1>
            <div class="store-description ps-3 ${storeData.storefront.blackText ? 'border-dark' : 'border-white'}">
                ${storeData.storefront.description.split('\n').map(p => `<p class="lead my-3">${p}</p>`).join('')}
                ${storeData.discordName ? `<p class="lead my-3"><i>Discord Name: <code>${storeData.discordName}</code></i></p>` : ''}
            </div>
        </div>
    </div>
  </div>`

  let inventoryHTML = `
  <div class="container">
    <div class="row row-cols-lg-auto g-3 align-items-center flex-row-reverse px-2">
        <div class="col-12">
            <input class="form-control ms-2 data-search" type="search" placeholder="Search inventory">
        </div>
    </div>
    <div class="row inventory-row">
      <div class="col-lg-12 mt-4 inventory-filtered" style="display:none;">
        <div class="card text-bg-info-subtle">
          <div class="card-body text-center">
            <div class="pt-3">
              <i class="bi bi-info-circle fs-1 text-info card-title"></i>
            </div>
            <h5 class="card-title">Some listed mods are hidden - Clear the <code>Search inventory</code> box to see all items</h5>
          </div>
        </div>
      </div>
    </div>
    <div class="row">`
  const results = storeData.mods.map(m => inventoryToInventoryCardDTO(m)).sort((a, b) => a.typeName.localeCompare(b.typeName) || b.qualityScore - a.qualityScore)
  for (const item of storeData.mods) {
    inventoryHTML += '<div class="col-lg-3 mt-4 item">'
    inventoryHTML += renderInventoryCard(item)
    inventoryHTML += '</div>'
  }
  inventoryHTML += `
    </div>
  </div>`
  const html = headingHTML + inventoryHTML
  document.querySelector('.content').innerHTML = html
  document.querySelector('.data-search').addEventListener('input', function () {
    filterCards()
  })
  for (const resultCard of [...document.querySelectorAll('.item')]) {
    resultCard.addEventListener('click', async () => {
      bindInventoryCardClickForContact(resultCard, results)
    })
  }
}

const filterCards = () => {
  const searchQuery = document.querySelector('.data-search').value.toLowerCase()
  let allItemsHidden = true
  document.querySelectorAll('.inventory-item').forEach((element) => {
    const text = element.querySelector('.type-name').textContent.toLowerCase()
    const shouldHide = (searchQuery && !text.includes(searchQuery))
    element.parentElement.style.display = shouldHide ? 'none' : 'block'
    if (!shouldHide) allItemsHidden = false
  })
  document.querySelector('.inventory-filtered').style.display = allItemsHidden ? 'block' : 'none'
}
export const displayStore = async (storeID) => {
  console.log('displayStore', storeID)
  renderStorePlaceholder()
  const storeData = await getStoreData(storeID)
  if (storeData.info && storeData.info === '404') {
    render404()
    return
  }
  console.log('storeData', storeData)
  await renderStore(storeData)
}
