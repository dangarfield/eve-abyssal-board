export const verifyAdmin = (req, res, next) => {
  const bearerHeader = req.headers.authorization
  if (typeof bearerHeader === 'undefined') {
    res.status(403).json({ error: 'bad-password' })
    return
  }
  //   console.log('bearerHeader', req.headers, bearerHeader, process.env.ADMIN_PASSWORD)
  if (bearerHeader === process.env.ADMIN_PASSWORD) {
    next()
  } else {
    res.status(403).json({ error: 'bad-password' })
  }
}

export const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers.authorization
  if (typeof bearerHeader === 'undefined') {
    res.status(403).json({ error: 'missing-token' })
    return
  }
  const token = bearerHeader.split(' ')[1]
  //   console.log('verifyToken', token)
  fetch(`https://esi.evetech.net/verify/?token=${token}`)
    .then(vReq => vReq.json())
    .then(vRes => {
      if (vRes.error) {
        res.status(403).json(vRes)
      } else if (vRes.ExpiresOn && new Date(`${vRes.ExpiresOn}Z`) - new Date() < 0) {
        res.status(403).json({ expired: 'token-expired' })
      } else {
        req.auth = {
          characterId: vRes.CharacterID,
          characterName: vRes.CharacterName
        }
        next()
      }
    })
}
