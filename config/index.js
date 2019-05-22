const path = require('path')

const CONFIG = {
  // 服务配置
  port: 9002,
  wsPort: 9009,
  autoOpen: false,

  // 密钥及token配置
  secret: 'jiangpeiran',
  tokenExpire: '30d',
  tokenHead: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',

  // 资源配置
  sourceImgURI: '/social_sources/img/',
  sourceMediaURI: '/social_sources/media/',
  sourceImgPath: path.join(__dirname, '../sources/img/'),
  sourceMediaPath: path.join(__dirname, '../sources/media/'),

  // 数据库配置
  db: 'mongodb://127.0.0.1:27017/social_club'
}

module.exports = CONFIG
