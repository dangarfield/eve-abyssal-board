import { getTypeIDCounts } from './board-api'
import { getAbyssModuleTypes } from './module-types'

const renderHomePlaceholder = () => {
  const html = `
    <div class="container">
        <div class="row pt-5">
            ${Array.from({ length: 18 }).map(b => `
            <div class="col-lg-2">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title placeholder-glow">
                            <span class="placeholder col-lg-12"></span>
                        </h5>
                        <p class="card-text placeholder-glow">
                            <span class="placeholder col-lg-12"></span>
                            <span class="placeholder col-lg-12"></span>
                            <span class="placeholder col-lg-12"></span>
                            <span class="placeholder col-lg-12"></span>
                            <span class="placeholder col-lg-12"></span>
                        </p>
                    </div>
                </div>
            </div>
            `).join('')}
        </div>
    </div>`
  document.querySelector('.content').innerHTML = html
}
const renderHome = (moduleTypes, typeCounts) => {
  const totalMods = Object.values(typeCounts).reduce((sum, v) => sum + v, 0)
  console.log('typeCounts', typeCounts, totalMods)
  const html = `
    <div class="container">
        
        <div class="row pt-5">
        ${moduleTypes.map(m => {
            return `
            ${m.group === 'Siege Module' ? '' : '<div class="col-lg-2">'}
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title fs-5 text-center">
                            <img height="" src="https://image.eveonline.com/Type/${m.categories[0].typeID}_32.png" style="padding-right: 7px;"><br/>
                            ${m.group}
                        </h5>
                        ${m.categories.map(c => {
                            return `<a class="btn btn-sm btn-block btn-primary w-100 card-link-wide" href="/buy/category/${c.typeID}">
                                ${c.categoryName}
                                <span class="fst-italic fw-lighter">(${typeCounts[c.typeID] !== undefined ? typeCounts[c.typeID] : 0})</span>
                            </a>`
                        }).join('')}
                    </div>
                </div>
            ${m.group === 'Fighter Support Unit' ? '' : '</div>'}
            `
        }).join('')}
        </div>

    </div>`
  document.querySelector('.content').innerHTML = html
}
export const displayBuyHome = async () => {
  renderHomePlaceholder()
  const moduleTypes = getAbyssModuleTypes()
  const typeCounts = await getTypeIDCounts()
  renderHome(moduleTypes, typeCounts)
}
