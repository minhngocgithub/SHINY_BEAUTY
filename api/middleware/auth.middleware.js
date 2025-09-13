const jwt = require('jsonwebtoken')
const authenticate = (req, res, next) => {
  if (req?.headers?.authorization?.startsWith('Bearer')) {
    const token = req.headers.authorization.split(' ')[1] 
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) return res.status(401).json({
        success: false,
        mes: 'Invalid access token'
      })
        req.user = decode   
        next()
      })
  } else {
    return res.status(401).json({
      success: false,
      mes: 'Require authentication!!!'
    })
}
}

const authorizeAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
      next();
    } else {
      res.status(401).json("You are not alowed to do that!");
    }
}

module.exports = { authenticate, authorizeAdmin }