import { getTypeIDCounts } from './board-api'
import { getAbyssModuleTypes } from './module-types'

const renderHome = (moduleTypes, typeCounts) => {
  console.log('typeCounts', typeCounts)
  const html = `
    <div class="container">
        
        <div class="row pt-5" data-masonry='{"percentPosition": true }'>
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
  const moduleTypes = getAbyssModuleTypes()
  const typeCounts = await getTypeIDCounts()
  renderHome(moduleTypes, typeCounts)
}
