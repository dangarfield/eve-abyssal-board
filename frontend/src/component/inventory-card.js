import { formatForUnit, formatToISKString } from '../utils'
// import { getUnitForDogma } from '../dogma-utils'

const getFriendlyStatus = (status) => {
  return status.replace(/_/g, ' ')
}
export const renderInventoryCard = (item) => {
  let html = ''
  const dogmaHtml = item.attributes.filter(a => a.type === 'mutation').map(dogma => {
    // const dogmaUnit = getUnitForDogma(dogma.unitID)
    return `
    <div class="d-flex flex-row gap-2 align-items-center px-1">
        <div class="p-0"><img src="/icons/${dogma.iconID}.png" width="32" height="32"></div>
        <div class="p-0">
            <p class="m-0">
                ${dogma.name}
                <!--
                <br/>
                zero ${dogma.allComparisonZero}<br/>
                diff ${dogma.allDiff}</p>
                v ${dogma.value}<br/>
                g ${dogma.allIsGood}<br/>
                min ${dogma.allMin}<br/>
                max ${dogma.allMax}<br/>
                zeroDiff ${dogma.allZeroDiff}<br/>
                perc ${dogma.allPerc}
                -->
            </p>
                
            <p class="m-0"><b>${formatForUnit(dogma.value, dogma.unitID)}  <span class="${dogma.isGood ? 'text-success' : 'text-danger'}">(${formatForUnit(dogma.diff, dogma.unitID, true)})</span></b></p>
        </div>
    </div>
    <div class="row gx-0 mb-2">
    <div class="col-6">
        <div class="progress justify-content-end" role="progressbar">
            <div class="progress-bar progress-bar-striped progress-bar-animated bg-danger" style="width: ${dogma.isGood ? '0' : dogma.perc}%"></div>
        </div>
    </div>
    <div class="col-6">
        <div class="progress" role="progressbar">
            <div class="progress-bar progress-bar-striped progress-bar-animated bg-success" style="width: ${dogma.isGood ? dogma.perc : '0'}%"></div>
        </div>
    </div>
    <div class="col-6">
        <div class="progress justify-content-end" role="progressbar">
            <div class="progress-bar progress-bar-striped progress-bar-animated bg-warning" style="width: ${dogma.allIsGood ? '0' : dogma.allPerc}%"></div>
        </div>
    </div>
    <div class="col-6">
        <div class="progress" role="progressbar">
            <div class="progress-bar progress-bar-striped progress-bar-animated bg-primary" style="width: ${dogma.allIsGood ? dogma.allPerc : '0'}%"></div>
        </div>
    </div>
    </div>`
  }).join('')

  const baseAttributeHtml = item.attributes.filter(a => a.type === 'base-module').map(attr => {
    // const dogmaUnit = getUnitForDogma(attr.unitID)

    // const maxDiff = attr.max - attr.min
    // const diff = attr.value - attr.min
    // let perc = Math.round(100 * (Math.abs(diff) / maxDiff))
    // if (!attr.highIsGood) perc = 100 - perc
    // console.log('baseAttributeHtml', attr, maxDiff, diff, perc)
    return `
    <div class="d-flex flex-row gap-2 align-items-center px-1">
        <div class="p-0"><img src="/icons/${attr.iconID}.png" width="32" height="32"></div>
        <div class="p-0">
            <p class="m-0">
            ${attr.name}<br/>
            ${attr.highIsGood}<br/>
            v ${attr.value}<br/>
            s ${attr.sourceValue}<br/>
            d ${attr.diff}<br/>
            g ${attr.isGood}<br/>
            min ${attr.min}<br/>
            max ${attr.max}<br/>
            zeroDiff ${attr.zeroDiff}<br/>
            perc ${attr.perc}<br/>
            </p>
            <p class="m-0"><b>${formatForUnit(attr.value * 100, attr.unitID)}  <span class="text-primary">(${formatForUnit(attr.diff * 100, attr.unitID, true)})</span></b></p>
        </div>
    </div>
    <div class="row gx-0 mb-2">
        <div class="col-6">
            <div class="progress justify-content-end" role="progressbar">
                <div class="progress-bar progress-bar-striped progress-bar-animated bg-warning" style="width: ${attr.isGood ? '0' : attr.perc}%"></div>
            </div>
        </div>
        <div class="col-6">
            <div class="progress" role="progressbar">
                <div class="progress-bar progress-bar-striped progress-bar-animated bg-primary" style="width: ${attr.isGood ? attr.perc : '0'}%"></div>
            </div>
        </div>
    </div>`
  }).join('')

  const appraisalHtml = item.appraisal
    ? `<div class="appraisal px-2 appraisal-complete" data-item-id="${item.itemID}">
        <p>Appraisal: ${item.appraisal.value} <i>Type: ${item.appraisal.type}</i></p>
    </div>`
    : `
    <div class="appraisal px-2" data-item-id="${item.itemID}">
        <div class="col placeholder-glow">
            <span class="col-3">Value:</span>
            <span class="placeholder col-6"></span>
            <span class="placeholder col-2"></span>
        </div>
        </div>
        <div class="mt-2 listing-price-holder px-2" style="display:none;">
        <div class="input-group mb-3">
            <input type="text" class="form-control listing-price no-click-close text-end" placeholder="Add listing price">
            <span class="input-group-text no-click-close">eg, 13m 1.9b</span>
        </div>
    </div>`
  const listingPriceHtml = item.listingPrice !== undefined ? `<div class="listing-price px-2"><p>Listing price: <b>${formatToISKString(item.listingPrice)}</b></p></div>` : ''

  let itemDisplayClass = ''
  if (item.status !== 'NONE') itemDisplayClass = ' listed'
  if (item.status === 'ON_SALE') itemDisplayClass = ' listed on-sale'
  if (item.status === 'AWAITING_PAYMENT') itemDisplayClass = ' listed awaiting-payment'
  html += `
        <div class="card-container inventory-item${itemDisplayClass}" data-item-id="${item.itemID}" data-status="${item.status}" role="button">
            <div class="card">
                <div class="card-body px-0 pb-0">
                    <div class="d-flex flex-row gap-2 align-items-center px-1">
                        <div class="p-0"><img src="https://images.evetech.net/types/${item.typeID}/icon?size=32"></div>
                        <div class="p-0">
                            <p class="lead mb-0 type-name"><b>${item.typeName}</b></p>
                            <span class="badge bg-secondary">${item.group}</span>
                            <span class="badge bg-secondary">${item.category}</span>
                            ${item.status !== 'NONE' ? `<span class="badge bg-primary">${getFriendlyStatus(item.status)}</span>` : ''}
                        </div>
                    </div>
                    <hr class="my-2"/>

                    <div class="d-flex flex-row gap-2 align-items-center px-1">
                        <div class="p-0"><img src="https://images.evetech.net/types/${item.mutatorTypeID}/icon?size=32"></div>
                        <div class="p-0">${item.mutatorTypeName}</div>
                    </div>
                    <div class="d-flex flex-row gap-2 align-items-center px-1">
                        <div class="p-0"><img src="https://images.evetech.net/types/${item.sourceTypeID}/icon?size=32"></div>
                        <div class="p-0">${item.sourceTypeName}</div>
                    </div>

                    <hr/>
                    ${dogmaHtml}
                    ${baseAttributeHtml}
                    <hr />
                    ${appraisalHtml}
                    ${listingPriceHtml}
                </div>
            </div>
            <span class="interaction-button">
            <button class="btn btn-primary btn-sm">
                <i class="bi bi-plus-circle-fill"></i>
            </button>
            </span>
          </div>`
  return html
}
