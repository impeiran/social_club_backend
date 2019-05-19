const Websocket = require('ws')
const jwt = require('jsonwebtoken')
const User = require('./models/m-user')
const CONFIG = require('./config')
const queryParser = require('./utils/queryParser')

let webSocketServer
let loginUsersMap = {}

// 消息接受
const messageHandler = function (data) {
  if (typeof data !== 'string') return

  data = JSON.parse(data) || {}

  // 接受用户信息
  console.log('websocket accept: ' + data.content)
}

// 退出链接
const closeHandler = function () {
  delete loginUsersMap[this.userId]
}

// 创建server
exports.create = options => {
  if (!options.port) return
  
  webSocketServer = new Websocket.Server({
    port: options.port
  })

  // 用户连接websocket处理
  webSocketServer.on('connection', (ws, request) => {
    const userToken = queryParser(request.url).token
    if (userToken) {
      const wholeToken = CONFIG.tokenHead + '.' + userToken
      jwt.verify(wholeToken, CONFIG.secret, async (err, decode) => {
        if (err) ws.close()
        const checkIdAndPwd = await User.find({ _id: decode.id, password: decode.password })
        if (checkIdAndPwd) {
          const userId = decode.id
          ws.userId = userId
          loginUsersMap[userId] = ws
        } else {
          ws.close()
        }
      })
    } else {
      ws.close()
    }

    ws.on('message', messageHandler)
    ws.on('close', closeHandler)
  })

  options.info && console.log(options.info)

  return webSocketServer
}

// 发送消息
exports.notificateUser = (userId, info) => {
  if (!userId || !loginUsersMap[userId]) return

  if (typeof info !== 'string') {
    info = JSON.stringify(info)
  }

  if (userId instanceof Array) {
    userId.forEach(item => {
      loginUsersMap[item].send(info)
    })
  } else {
    loginUsersMap[userId].send(info)
  }

}