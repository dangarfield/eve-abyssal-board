import { calcValueForDisplay, formatForUnit } from '../utils'

export const renderSearchCard = (type, defaultItem, showContracts) => {
  console.log('search card showContracts', showContracts)
  const dogmaHtml = type.attributes.map(attr => {
    const plusMinusValue = ((calcValueForDisplay(attr.allMax, attr.unitID) - calcValueForDisplay(attr.allMin, attr.unitID)) / 100) * attr.range
    const plusMinusDisplayValue = formatForUnit(plusMinusValue, attr.unitID)
    console.log('plusMinusDisplayValue', plusMinusValue, plusMinusDisplayValue, attr.allMax, attr.allMin, attr.range)

    // TODO - Something wrong with Capacitor Warfare Resistance Bonus slider - Cap Batteries

    return `
        <div class="d-flex flex-row gap-2 align-items-center px-1 attribute-holder attr-${attr.id}">
            <div class="p-0"><img src="/icons/${attr.iconID}.png" width="32" height="32"></div>
            <div class="p-0 w-100">
                <div class="d-flex flex-row gap-2 align-items-center">
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
                    <div class="ms-auto form-check form-switch"><input class="form-check-input attribute-active attr-${attr.id}" type="checkbox" role="switch" checked></div>
                </div>
                          
                <!--
                <p class="m-0">
                    <b class="" style="min-width: 300px;"><span style="min-width: 300px;" class="search-attr-${attr.id}-display">${formatForUnit(calcValueForDisplay(attr.searchValue, attr.unitID), attr.unitID)}</span></b>
                    <b class="px-2"><span class="search-attr-${attr.id}-range-display text-primary">± ${plusMinusDisplayValue}</span></b>
                </p>
                -->
                
                <div class="d-flex flex-row m-0 justify-content-start">
                    <div class="p-0 dogma-value"><b class=""><span class="search-attr-${attr.id}-display">${formatForUnit(calcValueForDisplay(attr.searchValue, attr.unitID), attr.unitID)}</span></b></div>
                    <div class="p-0"><b class="px-2"><span class="search-attr-${attr.id}-range-display text-primary">± ${plusMinusDisplayValue}</span></b></div>
                </div>
                
            </div>
        </div>
        <div class="row gx-0 mb-0">
            <div class="col-12">
                <div class="search-attr-holder">
                    <span class="bg-track"></span>
                    <span class="bg-selected bg-primary-subtle search-attr-${attr.id}-range" style="display:none;"></span>
                    <input type="range" class="form-range search-attr${attr.highIsGood ? '' : ' reverse'}" data-search-attr-id="${attr.id}" min="${attr.allMin}" max="${attr.allMax}" step="any" value="${attr.searchValue}">    
                </div>
            </div>
        </div>`
  }).join('')

  return `
<div class="card">
    <div class="card-body px-0 pb-0 pt-2">
        <div class="d-flex flex-row gap-2 align-items-center px-1">
            <div class="p-0"><img src="https://images.evetech.net/types/${type.typeID}/icon?size=32"></div>
            <div class="p-0">
                <p class="lead mb-0 type-name"><b>${type.name}</b></p>
                <span class="badge bg-secondary">${type.group}</span>
                <span class="badge bg-secondary">${type.category}</span>
            </div>
        </div>
        <hr class="my-2"/>

        <div class="d-flex flex-row gap-2 align-items-center px-1 remove-on-home-page">
            <div class="p-0"><img class="search-source-img" src="https://images.evetech.net/types/${type.typeID}/icon?size=32" style="opacity:0;"></div>
            <div class="p-0">
            <select class="form-select search-source my-1">
                <option value="0" selected>Any base module</option>
                ${Object.keys(type.sources).map(sourceTypeID => {
                    const source = type.sources[sourceTypeID]
                    return `<option value="${sourceTypeID}">${source.name}</option>`
                }).join('')}
            </select>
            </div>
        </div>

        <hr class="my-2 remove-on-home-page">
        ${dogmaHtml}
        <hr class="my-2">
        <div class="d-flex flex-row gap-2 align-items-center px-1 mb-2 remove-on-home-page">
            <div class="p-0">Compare:</div>
            <div class="p-0">
                <select class="form-select compare-source my-1">
                    <option value="0"${defaultItem === null ? ' selected' : ''}>Average value</option>
                    ${Object.keys(type.sources).map(sourceTypeID => {
                        const source = type.sources[sourceTypeID]
                        return `<option value="${sourceTypeID}"${defaultItem && defaultItem.name === source.name ? ' selected' : ''}>${source.name}</option>`
                    }).join('')}
                </select>
            </div>
        </div>
        <div class="d-flex flex-row gap-2 align-items-center justify-content-between px-1 mb-2 remove-on-home-page">
            <div class="p-0">
                <label class="form-check-label" for="show-contracts">Show public contracts</label>
            </div>
            <div class="p-0 align-end">
                <div class="form-check form-switch">
                    <input class="form-check-input show-contracts" type="checkbox" role="switch" id="show-contracts"${showContracts ? ' checked' : ''}>
                </div>
            </div>
        </div>
        <p class="px-1 text-center results-text lead">Waiting for results to load</p>
    </div>
</div>`
}
