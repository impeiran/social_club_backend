/*
** token权限验证中间件
*/
const jwt = require('jsonwebtoken')
const resFormat = require('../utils/res-formatter')
const User = require('../models/m-user')
const CONFIG= require('../config')

// 无需验证路由地址
const NO_AUTH_ROUTES = [
  '/api/signIn', '/api/signUp', '/api/test', '/public', '/public/sources', '/favicon.ico'
]

module.exports = async function (req, res, next) {
  if (req.method === 'OPTIONS' && req.headers['access-control-request-headers']) {
    return res.send('OPTION')
  } else if (req.method === 'GET' && !req.headers['authorization']) {
    req.userId = 'visitor'
    return next()
  } else if (NO_AUTH_ROUTES.includes(req.path) || /^\/public/.test(req.path)) {
    return next()
  }
  const userToken = req.headers['authorization']
  if (userToken) {
    const wholeToken = CONFIG.tokenHead + '.' + userToken
    jwt.verify(wholeToken, CONFIG.secret, async (err, decode) => {
      if (err) return res.status(401).json(resFormat({ msg: err.message }))
      const checkIdAndPwd = await User.find({_id: decode.id, password: decode.password})
      if (checkIdAndPwd) {
        req.userId = decode.id
        return next()
      } else {
        return res.status(403).json(resFormat({ msg: err.message }))
      }
    })
  } else {
    res.status(401).json(resFormat({ msg: 'lack of authorization' }))
  }
}