const path = require('path')
const CONFIG= require('../config')

module.exports = (target) => {
  if (target instanceof Array) {
    return target.map(item => {
      return CONFIG.sourceImgURI + item
    })
  } else if (typeof target === 'string' && path.extname(target).toLowerCase().slice(1) === 'mp4') {
    return CONFIG.sourceMediaURI + target
  } else {
    return CONFIG.sourceImgURI + target
  }
}