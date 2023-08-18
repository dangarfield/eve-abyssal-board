import { nanoid } from 'nanoid'
import { getUnitStringForUnitId } from './module-types'

export const loadData = () => {
  const dataString = window.localStorage.getItem('abyssal-board')
  if (dataString) {
    const data = JSON.parse(dataString)
    // delete data['admin-token']
    // clearData('admin-token')
    return data
  }
  return {}
}
export const saveData = (key, value) => {
  const existingData = loadData()
  const newData = { ...existingData, [key]: value }
  const newDataString = JSON.stringify(newData)
  window.localStorage.setItem('abyssal-board', newDataString)
}
export const clearData = (key) => {
  const existingData = loadData()
  delete existingData[key]
  const newDataString = JSON.stringify(existingData)
  window.localStorage.setItem('abyssal-board', newDataString)
}

export const listingPriceStringToInt = (inputValue) => {
  const digitsString = inputValue.match(/[\d.]+/g)
  let value = parseFloat(digitsString ? digitsString.join('') : '')

  const inputValueLower = inputValue.toLowerCase()
  if (inputValueLower.includes('k')) value = value * 1000
  if (inputValueLower.includes('m')) value = value * 1000000
  if (inputValueLower.includes('b')) value = value * 1000000000
  if (inputValueLower.includes('t')) value = value * 1000000000000
  console.log('listingPriceStringToInt', inputValue, value)
  return value
}
export const formatToISKString = (number) => {
  const suffixes = ['', 'k', 'm', 'b', 't']
  let absNumber = Math.abs(number)
  let suffixIndex = 0
  while (absNumber >= 1000 && suffixIndex < suffixes.length - 1) {
    absNumber /= 1000
    suffixIndex++
  }
  const formattedNumber = Number.isInteger(absNumber) ? absNumber : absNumber.toFixed(1)
  const suffix = suffixes[suffixIndex]
  return number >= 0 ? formattedNumber + suffix + ' ISK' : '-' + formattedNumber + suffix + ' ISK'
}
export const calcValueForDisplay = (value, unitID) => {
  switch (unitID) {
    case 101: return (value / 1000)
    case 109: return (value * 100) - 100
    case 111: return 100 - (value * 100)
    default: return value
  }
}

export const formatForUnit = (value, unitID, addSign) => {
  let unit = getUnitStringForUnitId(unitID)
  let outputValue = ''
  switch (unitID) {
    case 1:
      outputValue = value > 0 ? (Math.floor(value) + '') : (Math.ceil(value) + '')
      if (value > 10000) {
        outputValue = (value / 1000).toFixed(2)
        unit = 'km'
      }
      break
    case 124: outputValue = value.toFixed(1); break // % Maximum velocity bonus, Signature Radius Modifier
    case 109: case 104: outputValue = value.toFixed(3); break // x Damage Modifier
    // case 'GJ': outputValue = value.toFixed(1); break
    // case 's': outputValue = (value / 1000).toFixed(2); break
    // case 'HP/s': outputValue = (value * 1000).toFixed(2); break
    // case 'x': outputValue = value.toFixed(3); break
    // case 'm': outputValue = Math.floor(value).toFixed(0); break
    // // case '%': outputValue = (100 * (1 - value)).toFixed(2); break // Lots of mess here, should really use unit codes
    // case '%': outputValue = (value / 100).toFixed(2); break
    // // case '%': outputValue = (value).toFixed(2); break
    default: outputValue = value.toFixed(2); break
  }
  const signValue = (addSign && !outputValue.includes('-')) ? '+' : ''
  outputValue = outputValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',').replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '')
  return `${signValue}${outputValue}${unit !== '' ? ` ${unit}` : ''}`
}
export const formatMilliseconds = (milliseconds) => {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)

  const formattedSeconds = seconds % 60
  const formattedMinutes = minutes > 0 ? `${minutes}m ` : ''
  const formattedTime = formattedMinutes + `${formattedSeconds}s`
  return formattedTime
}
export const triggerRefreshTime = (elementSelector, typeMessage, expireTime, lastModified) => {
  const refreshTime = () => {
    const timeDiff = expireTime - new Date()
    const ele = document.querySelector(elementSelector)
    // console.log('timeDiff', timeDiff)
    if (ele === undefined) {
      clearInterval(refreshTimeInterval)
    } else if (timeDiff < 0) {
      ele.innerHTML = '<span class="text-primary">New data available on EVE API - Refresh the page to load it</span>'
      clearInterval(refreshTimeInterval)
    } else {
      try {
        ele.innerHTML = `${typeMessage} correct and cached by EVE API as of ${lastModified.toLocaleTimeString()}. Next update available in <span class="text-primary">${(formatMilliseconds(timeDiff))}</span>`
      } catch (error) {
        // It's gone, oh well...
      }
    }
  }
  const refreshTimeInterval = setInterval(refreshTime, 1000)
  refreshTime()
}

export const showModalAlert = async (title, contentHtml, footerConfig) => {
  return new Promise((resolve, reject) => {
    const id = `modal-${nanoid(10)}`
    const html = `<div class="modal fade" id="${id}" tabindex="-1" role="dialog">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fs-5">${title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
          <div class="modal-body">
            ${contentHtml}
          </div>
          <div class="modal-footer">
            ${footerConfig ? footerConfig.map((f, i) => `<button type="button" class="btn ${f.style} modal-footer-btn-${i}">${f.buttonText}</button>`).join('') : ''}
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>`
    document.body.insertAdjacentHTML('beforeend', html)
    if (footerConfig) {
      for (let i = 0; i < footerConfig.length; i++) {
        document.querySelector(`.modal .modal-footer-btn-${i}`).addEventListener('click', () => {
          footerConfig[i].cb()
        })
      }
    }

    const modalEle = document.getElementById(id)
    const modal = new window.bootstrap.Modal(modalEle, {})
    modal.show()
    modalEle.addEventListener('hidden.bs.modal', event => {
      console.log('destroy')
      modal.dispose()
      modalEle.remove()
      resolve()
    })
  })
}
export const deepCopy = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}

export const cloneSimpleList = (originalList) => {
  return originalList.map(obj => ({ ...obj }))
}
