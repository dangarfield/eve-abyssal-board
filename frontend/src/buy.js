import { getAbyssModuleTypes } from './module-types'

const renderHome = (moduleTypes) => {
  const html = `
    <div class="container">
        <div class="row">
            <div class="col text-center my-2">
                <h1>Abyssal Board</h1>
            </div>
        </div>
        <div class="row">
        ${moduleTypes.map(m => {
            return `
            <div class="col-md-3 col-12">
                <img height="21px" src="https://image.eveonline.com/Type/${m.categories[0].typeID}_32.png" style="padding-right: 7px;">
                ${m.group}
            </div>
            <div class="col-md-9 col-12 row m-0 p-0">
                ${m.categories.map(c => {
                    return `<div class="col p-1"><a class="btn btn-sm btn-block btn-primary w-100" href="/buy/category/${c.typeID}">${c.categoryName}</a></div>`
                }).join('')}
            </div>
            <div class="w-100"></div>
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
