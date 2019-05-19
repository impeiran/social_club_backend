const fs = require('fs')
const path = require('path')
const CONFIG= require('../config')


module.exports = (files, userId, flag) => {
  let result = {}
  for(let key in files) {
    let filesName = []
    if (files[key] instanceof Array) {
      files[key].forEach(item => {
        const newName = item.hash + `.${userId}` + path.extname(item.name).toLowerCase()
        fs.renameSync(item.path, CONFIG.sourceImgPath + newName)
        filesName.push(newName)
      })
    } else {
      const newName = files[key].hash + `.${userId}` + path.extname(files[key].name).toLowerCase()
      const newPath = flag === 'images' ? CONFIG.sourceImgPath : CONFIG.sourceMediaPath
      fs.renameSync(files[key].path, newPath + newName)
      filesName.push(newName)
    }
    result[key] = filesName
  }
  return result
}