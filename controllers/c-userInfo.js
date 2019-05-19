const formidable = require('formidable')
const { isEmpty } = require('lodash')

const fs = require('fs')
const path = require('path')
const User = require('../models/m-user')
const Moment = require('../models/m-moment')
const resFormat = require('../utils/res-formatter')
const addPrefixURI = require('../utils/addPrefixURI')
const renameFormFiles = require('../utils/renameFormFiles')
const _common = require('./_common')
const CONFIG= require('../config')

const editInfoFilter = {
  account: 0,
  password: 0,
  _id: 0,
  __v: 0
}

// 关注用户
exports.followUser = async (req, res) => {
  const userId = req.userId
  const { targetId, flag } = req.body
  if (flag === 'cancel') {
    await User.findByIdAndUpdate(userId, { $pull: { follows: targetId } })
    await User.findByIdAndUpdate(targetId, { $pull: { fans: userId }})
  } else {
    const userInfo = await User.findByIdAndUpdate(userId, { $push: { follows: targetId } })
    User.findByIdAndUpdate(targetId, { $push: { fans: userId }}).then(result => {
      _common.genNotification([targetId], {
        flag: 'follow',
        from_id: userInfo._id,
        from_name: userInfo.nickname,
        origin_moment: ''
      })
    })
  }
  res.send(resFormat({
    success: 1,
    msg: '操作成功！'
  }))
}

// 编辑信息
exports.Edit = (req, res) => {
  const userId = req.userId
  let resultFields = {}
  let resultFile = ''

  let inComing = new formidable.IncomingForm()
  inComing.hash = 'md5'
  inComing.uploadDir = CONFIG.sourceImgPath

  inComing.parse(req, async (err, fields, file) => {
    const checkExistName = await User.findOne({ nickname: fields.nickname })
    if (checkExistName && checkExistName._id != req.userId) {
      return res.send(resFormat({
        msg: '昵称已存在'
      }))
    }
    resultFile = !isEmpty(file) ? addPrefixURI(renameFormFiles(file, userId, 'images').avatar[0]) : ''
    resultFields = resultFile ? { ...fields, avatar: resultFile } : {...fields}

    // 删除原图
    const historyInfo = await User.findById(userId)
    if (historyInfo.avatar) {
      const historyAvatar = path.basename(historyInfo.avatar)
      fs.unlink(CONFIG.sourceImgPath + historyAvatar, err => {
        err && console.log('删除旧头像失败: ' + historyAvatar)
      })
    }

    // 更新
    User.findOneAndUpdate({ _id: userId }, resultFields, { fields: editInfoFilter, new: true })
      .exec((err, result) => {
        if (err) {
          res.status(500).send({
            msg: err.message
          })
        } else {
          res.send(resFormat({
            success: 1,
            data: result,
            msg: '更新成功！'
          }))
        }
      })
  })
}

exports.getInfo = async (req, res) => {
  const userId = req.userId
  const { targetId } = req.query
  const info = await User.getInfo({ _id: targetId}, userId)
  const moments_num = await Moment.getTargetBlogNums(targetId)
  res.send(resFormat({
    success: 1,
    data: {
      ...info,
      moments_num
    }
  }))
}

exports.search = async (req, res) => {
  const userId = req.userId
  let { keyword, page, size } = req.query
  page = parseInt(page) || 1
  size = parseInt(size) || 15
  const result = await User.find({ nickname: new RegExp(keyword) }, '-account -password -follows -likes')
    .skip((page - 1) * size)
    .limit(size)

  let newResult = result.map(item => {
    let newItem = JSON.parse(JSON.stringify(item))
    if (userId !== 'visitor') {
      newItem.hasFollowed = newItem.fans.indexOf(userId) !== -1
    }
    delete newItem.fans
    return newItem
  })

  res.send(resFormat({
    success: 1,
    data: newResult
  }))
  
}

exports.getInfoFollows = async (req, res) => {
  const userId = req.userId
  const { targetId, page, size } = req.query
  let currentPage = parseInt(page)
  let currentSize = parseInt(size)
  let result = await User.getByPopulate(userId, targetId, 'follows', currentPage, currentSize)
  res.send(resFormat({
    success: 1,
    data: result.reverse()
  }))
}

exports.getInfoFans = async (req, res) => {
  const userId = req.userId
  const { targetId, page, size } = req.query
  let currentPage = parseInt(page)
  let currentSize = parseInt(size)
  let result = await User.getByPopulate(userId, targetId, 'fans', currentPage, currentSize)
  res.send(resFormat({
    success: 1,
    data: result.reverse()
  }))
}