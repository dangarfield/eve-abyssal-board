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
