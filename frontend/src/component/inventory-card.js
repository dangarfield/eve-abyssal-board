import { formatForUnit, formatToISKString } from '../utils'
import { getUnitForDogma } from '../dogma-utils'

export const renderInventoryCard = (item) => {
  let html = ''
  const dogmaHtml = item.attributes.map(dogma => {
    const dogmaUnit = getUnitForDogma(dogma.attributeId)

    const zeroValue = dogma.value - dogma.diff
    const zeroDiff = Math.abs((dogma.isGood ? dogma.max : dogma.min) - zeroValue)
    const perc = Math.round(100 * (Math.abs(dogma.diff) / zeroDiff))

    return `
    <div class="d-flex flex-row gap-2 align-items-center px-1">
        <div class="p-0"><img src="/icons/${dogma.iconID}.png" width="32" height="32"></div>
        <div class="p-0">
            <p class="m-0">${dogma.attributeName}</p>
            <p class="m-0"><b>${formatForUnit(dogma.value, dogmaUnit)}  <span class="${dogma.isGood ? 'text-success' : 'text-danger'}">(${formatForUnit(dogma.diff, dogmaUnit, true)})</span></b></p>
        </div>
    </div>
    <div class="row gx-0 mb-2">
        <div class="col-6">
            <div class="progress justify-content-end" role="progressbar">
                <div class="progress-bar progress-bar-striped progress-bar-animated bg-danger" style="width: ${dogma.isGood ? '0' : perc}%"></div>
            </div>
        </div>
        <div class="col-6">
            <div class="progress" role="progressbar">
                <div class="progress-bar progress-bar-striped progress-bar-animated bg-success" style="width: ${dogma.isGood ? perc : '0'}%"></div>
            </div>
        </div>
    </div>`
  }).join('')

  const appraisalHtml = item.appraisal
    ? `<div class="appraisal px-2 appraisal-complete" data-item-id="${item.itemId}">
        <p>Appraisal: ${item.appraisal.value} <i>Type: ${item.appraisal.type}</i></p>
    </div>`
    : `
    <div class="appraisal px-2" data-item-id="${item.itemId}">
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

  html += `
        <div class="card-container inventory-item${item.status ? ' listed' : ''}" data-item-id="${item.itemId}" data-status="${item.status}" role="button">
            <div class="card">
                <div class="card-body px-0 pb-0">
                    <div class="d-flex flex-row gap-2 align-items-center px-1">
                        <div class="p-0"><img src="https://images.evetech.net/types/${item.typeId}/icon?size=32"></div>
                        <div class="p-0">
                            <p class="lead mb-0 type-name"><b>${item.typeName}</b></p>
                            <span class="badge bg-secondary">${item.abyssalModuleGroup}</span>
                            <span class="badge bg-secondary">${item.abyssalModuleCategory}</span>
                            ${item.status ? `<span class="badge bg-primary">${item.status}</span>` : ''}
                        </div>
                    </div>
                    <hr class="my-2"/>

                    <div class="d-flex flex-row gap-2 align-items-center px-1">
                        <div class="p-0"><img src="https://images.evetech.net/types/${item.mutatorTypeId}/icon?size=32"></div>
                        <div class="p-0">${item.mutatorTypeName}</div>
                    </div>
                    <div class="d-flex flex-row gap-2 align-items-center px-1">
                        <div class="p-0"><img src="https://images.evetech.net/types/${item.sourceTypeId}/icon?size=32"></div>
                        <div class="p-0">${item.sourceTypeName}</div>
                    </div>

                    <hr/>
                    ${dogmaHtml}
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
