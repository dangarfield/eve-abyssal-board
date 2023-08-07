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

export const verifyToken = async (req, res, next) => {
  const bearerHeader = req.headers.authorization
  if (typeof bearerHeader === 'undefined') {
    res.status(403).json({ error: 'missing-token' })
    return
  }
  const token = bearerHeader.split(' ')[1]
  console.log('verifyToken', token)
  try {
    const vReq = await fetch(`https://esi.evetech.net/verify/?token=${token}`)
    const vRes = await vReq.json()
    if (vRes.error) {
      console.log('verifyToken error')
      res.status(403).json(vRes)
    } else if (vRes.ExpiresOn && new Date(`${vRes.ExpiresOn}Z`) - new Date() < 0) {
      console.log('verifyToken expired')

      // res.error(401, 'Not Modified')
      res.status(403).json({ expired: 'token-expired' })
    } else {
      req.auth = {
        characterId: vRes.CharacterID,
        characterName: vRes.CharacterName
      }
      console.log('verifyToken ok')
      next()
    }
  } catch (error) {
    res.status(500).json(error)
  }
}
