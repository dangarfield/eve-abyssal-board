import { getAbyssModuleTypes } from './module-types'

const renderHome = (moduleTypes) => {
  const html = `
    <div class="container">
        
        <div class="row pt-5" data-masonry='{"percentPosition": true }'>
        ${moduleTypes.map(m => {
            return `
            <div class="col-lg-2">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title fs-5 text-center">
                            <img height="" src="https://image.eveonline.com/Type/${m.categories[0].typeID}_32.png" style="padding-right: 7px;"><br/>
                            ${m.group}
                        </h5>
                        ${m.categories.map(c => {
                            return `<a class="btn btn-sm btn-block btn-primary w-100 card-link-wide" href="/buy/category/${c.typeID}">${c.categoryName}</a>`
                        }).join('')}
                    </div>
                </div>
            </div>
            `
        }).join('')}
        </div>

    </div>`
  document.querySelector('.content').innerHTML = html
}
export const displayBuyHome = async () => {
  const moduleTypes = getAbyssModuleTypes()
  renderHome(moduleTypes)
}
