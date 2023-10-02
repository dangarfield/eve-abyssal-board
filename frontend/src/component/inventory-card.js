import { formatForUnit, formatToISKString } from '../utils'
// import { getUnitForDogma } from '../dogma-utils'

const getFriendlyStatus = (status) => {
  return status.replace(/_/g, ' ')
}
export const renderInventoryCard = (item) => {
  let html = ''
  const dogmaHtml = item.attributes.filter(a => a.type === 'mutation').map(attr => {
    // const dogmaUnit = getUnitForDogma(attr.unitID)
    return `
    <div class="d-flex flex-row gap-2 align-items-center px-1">
        <div class="p-0"><img src="/icons/${attr.iconID}.png" width="32" height="32"></div>
        <div class="p-0">
            <p class="m-0">
            ${attr.name}
                <!--
                <br/>
                zero ${attr.allComparisonZero}<br/>
                diff ${attr.allDiff}</p>
                v ${attr.value}<br/>
                g ${attr.allIsGood}<br/>
                min ${attr.allMin}<br/>
                max ${attr.allMax}<br/>
                zeroDiff ${attr.allZeroDiff}<br/>
                perc ${attr.allPerc}
                -->
            </p>
                
            <p class="m-0"><b>${formatForUnit(attr.valueDisplay, attr.unitID)}  <span class="${attr.isGood ? 'text-success' : 'text-danger'}">(${formatForUnit(attr.diffDisplay, attr.unitID, true)})</span></b></p>
        </div>
    </div>
    <div class="row gx-0 mb-2">
    <div class="col-6">
        <div class="progress justify-content-end" role="progressbar">
            <div class="progress-bar progress-bar-striped progress-bar-animated bg-danger" style="width: ${attr.isGood ? '0' : attr.perc}%"></div>
        </div>
    </div>
    <div class="col-6">
        <div class="progress" role="progressbar">
            <div class="progress-bar progress-bar-striped progress-bar-animated-reverse bg-success" style="width: ${attr.isGood ? attr.perc : '0'}%"></div>
        </div>
    </div>
    <div class="col-6">
        <div class="progress short justify-content-end" role="progressbar">
            <div class="progress-bar progress-bar-striped progress-bar-animated bg-warning" style="width: ${attr.allIsGood ? '0' : attr.allPerc}%"></div>
        </div>
    </div>
    <div class="col-6">
        <div class="progress short" role="progressbar">
            <div class="progress-bar progress-bar-striped progress-bar-animated-reverse bg-primary" style="width: ${attr.allIsGood ? attr.allPerc : '0'}%"></div>
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
            ${attr.name}
            <!--<br/>
            ${attr.highIsGood}<br/>
            v ${attr.value}<br/>
            s ${attr.sourceValue}<br/>
            d ${attr.diff}<br/>
            g ${attr.isGood}<br/>
            min ${attr.min}<br/>
            max ${attr.max}<br/>
            zeroDiff ${attr.zeroDiff}<br/>
            perc ${attr.perc}<br/>
            -->
            </p>
            <p class="m-0"><b>${formatForUnit(attr.valueDisplay, attr.unitID)}  <span class="text-primary">(${formatForUnit(attr.diffDisplay, attr.unitID, true)})</span></b></p>
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
                <div class="progress-bar progress-bar-striped progress-bar-animated-reverse bg-primary" style="width: ${attr.isGood ? attr.perc : '0'}%"></div>
            </div>
        </div>
    </div>`
  }).join('')

  const derivedAttributeHtml = item.attributes.filter(a => a.type === 'derived').map(attr => {
    // const dogmaUnit = getUnitForDogma(attr.unitID)

    // const maxDiff = attr.max - attr.min
    // const diff = attr.value - attr.min
    // let perc = Math.round(100 * (Math.abs(diff) / maxDiff))
    // if (!attr.highIsGood) perc = 100 - perc
    // console.log('baseAttributeHtml', attr, maxDiff, diff, perc)
    // console.log('derivedAttributeHtml', attr)
    return `
    <div class="d-flex flex-row gap-2 align-items-center px-1">
        <div class="p-0"><img src="/icons/${attr.iconID}.png" width="32" height="32"></div>
        <div class="p-0">
            <p class="m-0">
            ${attr.name}
            <!--<br/>
            ${attr.highIsGood}<br/>
            v ${attr.value}<br/>
            z ${attr.allComparisonZero}<br/>
            d ${attr.diff}<br/>
            g ${attr.isGood}<br/>
            min ${attr.min}<br/>
            max ${attr.max}<br/>
            zeroDiff ${attr.zeroDiff}<br/>
            perc ${attr.perc}<br/>
            -->
            </p>
            <p class="m-0"><b>${formatForUnit(attr.valueDisplay, attr.unitID)}  <span class="${attr.isGood ? 'text-success' : 'text-danger'}">(${formatForUnit(attr.diffDisplay, attr.unitID, true)})</span></b></p>
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
                <div class="progress-bar progress-bar-striped progress-bar-animated-reverse bg-primary" style="width: ${attr.isGood ? attr.perc : '0'}%"></div>
            </div>
        </div>
    </div>
    `
  }).join('')

  const appraisalHtml = item.appraisal
    ? `<div class="appraisal px-2 appraisal-complete" data-item-id="${item.itemID}">
        <div class="d-flex flex-row gap-2 align-items-center justify-content-between px-0">
            <span class="p-0"><p>Appraisal:</p></span>
            <span class="p-0 text-end">
            ${item.appraisal.map(appraisal => `<p><b>${formatToISKString(appraisal.price)}</b> <i>(${appraisal.type})</i></p>`).join('')}
            </span>
        </div>
    </div>
    <div class="mt-2 listing-price-holder px-2" style="display:none;">
        <div class="input-group mb-3">
            <input type="text" class="form-control listing-price no-click-close text-end" placeholder="Add listing price" value="${formatToISKString(item.appraisal[0].price).replace(' ISK', '')}">
            <span class="input-group-text no-click-close">eg, 13m 1.9b</span>
        </div>
    </div>`
    : `
    <div class="appraisal px-2" data-item-id="${item.itemID}">
        <div class="col placeholder-glow">
            <span class="col-3">Appraisal:</span>
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
  const listingPriceHtml = item.listingPrice !== undefined
    ? `
    <div class="listing-price px-2">
        <div class="d-flex flex-row gap-2 align-items-center justify-content-between px-0">
            <span class="p-0"><p>List price:</p></span>
            <span class="p-0 text-end">
                <p><b>${formatToISKString(item.listingPrice)}</b>
            </span>
        </div>
    </div>
  `
    : ''

  const contractPriceHtml = item.contractPrice !== undefined
    ? `
    <div class="listing-price px-2">
        <div class="d-flex flex-row gap-2 align-items-center justify-content-between px-0">
            <span class="p-0"><p>Contract price:</p></span>
            <span class="p-0 text-end">
                <p><b>${formatToISKString(item.contractPrice)}</b>
            </span>
        </div>
    </div>
    `
    : ''

  let itemDisplayClass = ''
  let statusBG = 'bg-dark'
  if (item.status !== 'NONE') {
    itemDisplayClass = ' listed'
    statusBG = 'bg-dark'
  }
  if (item.status === 'ON_SALE') {
    itemDisplayClass = ' listed on-sale'
    statusBG = 'bg-primary'
  }
  if (item.status === 'AWAITING_PAYMENT') {
    itemDisplayClass = ' listed awaiting-payment'
    statusBG = 'bg-danger'
  }
  if (item.status === 'CONTRACT') {
    itemDisplayClass = ' contract'
    statusBG = 'bg-warning text-dark'
  }
  let isBricked = false
  if (Math.round(item.qualityScore) < 15) {
    isBricked = true
  }
  const qualityScoreHtml = item.qualityScore === undefined
    ? ''
    : (
        isBricked
          ? `<span class="badge bg-danger"><i class="bi bi-hand-thumbs-down-fill"></i> ${Math.round(item.qualityScore)}%</span>`
          : `<span class="badge bg-primary"><i class="bi bi-hand-thumbs-up-fill"></i> ${Math.round(item.qualityScore)}%</span>`
      )
  //   isBricked
  //                                 `<span class="badge bg-primary"><i class="bi bi-hand-thumbs-up-fill"></i> ${Math.round(item.qualityScore)}%</span>` : '':
  //                                 `<span class="badge bg-primary"><i class="bi bi-hand-thumbs-up-fill"></i> ${Math.round(item.qualityScore)}%</span>` : ''
  //                             }}
  html += `
        <div class="card-container inventory-item${itemDisplayClass}${item.premium ? ' premium' : ''}${isBricked ? ' bricked' : ''}" data-item-id="${item.itemID}" data-status="${item.status}" role="button">
            <div class="card">
                <div class="card-body px-0 pb-0">
                    <div class="d-flex flex-row gap-2 align-items-center px-1">
                        <div class="p-0"><img src="https://images.evetech.net/types/${item.typeID}/icon?size=32"></div>
                        <div class="p-0">
                            <p class="lead mb-0 type-name">
                                <b>
                                    ${item.typeName}
                                </b>
                            </p>
                            ${qualityScoreHtml}
                            <span class="badge bg-secondary">${item.group}</span>
                            <span class="badge bg-secondary">${item.category}</span>
                            ${item.status !== 'NONE' ? `<span class="badge ${statusBG}">${getFriendlyStatus(item.status)}</span>` : ''}
                        </div>
                    </div>
                    <hr class="my-2"/>

                    <!--
                    <div class="d-flex flex-row gap-2 align-items-center px-1">
                        <div class="p-0"><img src="https://images.evetech.net/types/${item.mutatorTypeID}/icon?size=32"></div>
                        <div class="p-0">${item.mutatorTypeName}</div>
                    </div>
                    -->
                    <div class="d-flex flex-row gap-2 align-items-center px-1">
                        <div class="p-0"><img src="https://images.evetech.net/types/${item.sourceTypeID}/icon?size=32"></div>
                        <div class="p-0">${item.sourceTypeName} <span class="badge bg-secondary">${item.mutatorTypeName.split(' ')[0]}</span></div>
                    </div>

                    <hr class="my-2" />
                    ${dogmaHtml}
                    ${baseAttributeHtml}
                    ${derivedAttributeHtml}
                    <hr class="my-2" />
                    ${appraisalHtml}
                    ${listingPriceHtml}
                    ${contractPriceHtml}
                </div>
            </div>
            <span class="interaction-button">
            <button class="btn btn-primary btn-sm">
                <i class="bi bi-plus-circle-fill"></i>
            </button>
            </span>
            ${item.premium
            ? `
            <span class="premium-icon">
            <button class="btn btn-warning btn-sm">
                <i class="bi bi-star-fill"></i>
            </button>
            </span>`
 : ''}
            ${item.metaGroupIconID ? `<span class="faction-icon"><img src="/icons/${item.metaGroupIconID}.png" width='32px'/></span>` : ''}
          </div>`
  return html
}
