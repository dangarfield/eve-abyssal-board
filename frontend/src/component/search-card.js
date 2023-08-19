import { formatForUnit } from '../utils'

export const renderSearchCard = (type) => {
  const dogmaHtml = type.attributes.map(attr => {
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
                <p class="m-0">
                    <b class=""><span class="search-attr-${attr.id}-display">${formatForUnit(attr.searchValue, attr.unitID)}</span></b>
                    <b class="px-2"><span class="search-attr-${attr.id}-range-display text-primary">± ${formatForUnit(((attr.allMax - attr.allMin) / 100) * attr.range, attr.unitID)}</span></b>
                </p>

            </div>
        </div>
        <div class="row gx-0 mb-0">
            <div class="col-12">
                <div class="search-attr-holder">
                    <span class="bg-track"></span>
                    <span class="bg-selected search-attr-${attr.id}-range"></span>
                    <input type="range" class="form-range search-attr" data-search-attr-id="${attr.id}" min="${attr.allMin}" max="${attr.allMax}" step="any" value="${attr.allComparisonZero}">    
                </div>
            </div>
        </div>`
  }).join('')

  return `
<div class="card">
    <div class="card-body px-0 pb-0">
        <div class="d-flex flex-row gap-2 align-items-center px-1">
            <div class="p-0"><img src="https://images.evetech.net/types/${type.typeID}/icon?size=32"></div>
            <div class="p-0">
                <p class="lead mb-0 type-name"><b>${type.name}</b></p>
                <span class="badge bg-secondary">${type.group}</span>
                <span class="badge bg-secondary">${type.category}</span>
            </div>
        </div>
        <hr class="my-2"/>

        <div class="d-flex flex-row gap-2 align-items-center px-1">
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

        <hr class="my-2">
        ${dogmaHtml}
        <hr class="my-2">
        <p class="px-1 text-center results-text lead">Waiting for results to load</p>
    </div>
</div>`
}
