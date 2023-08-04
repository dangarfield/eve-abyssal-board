const getTextBetweenStrings = (mainString, startString, endString) => {
  const startIndex = mainString.indexOf(startString)
  if (startIndex === -1) return '' // Start string not found
  const endIndex = mainString.indexOf(endString, startIndex + startString.length)
  if (endIndex === -1) return '' // End string not found
  return mainString.substring(startIndex + startString.length, endIndex)
}
const getValueAndConfidenceFromHtml = (text) => {
  const appraisalText = getTextBetweenStrings(text, 'Estimated Value', 'Contract history')
  const regex = /<dd>(.*?)<\/dd>/g
  const matches = []
  let match
  while ((match = regex.exec(appraisalText)) !== null) {
    matches.push(match[1].replace('(nan)', '').trim())
    console.log('match', match[1].trim())
  }
  return { value: matches[0], confidence: matches[1] }
}
export const getAppraisalForItemId = async (itemId) => {
  try {
    // For now, just use mutaplasmid.space appraisal
    const req = await fetch(`https://thingproxy.freeboard.io/fetch/https://mutaplasmid.space/module/${itemId}/`)
    const text = await req.text()
    const appraisal = getValueAndConfidenceFromHtml(text)
    console.log('appraisal', appraisal)
    return appraisal
  } catch (error) {
    return { value: 'Unavailable', confidence: 'Unavailable' }
  }
}
