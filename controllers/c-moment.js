const fs = require('fs')
const path = require('path')

const mongoose = require('mongoose')
const formidable = require('formidable')
const _common = require('./_common')
const wsServer = require('../ws-server')
const resFormat = require('../utils/res-formatter')
const addPrefixURI = require('../utils/addPrefixURI')
const renameFormFiles = require('../utils/renameFormFiles')
const CONFIG= require('../config')

const User = require('../models/m-user')
const Moment = require('../models/m-moment')

const posterInfoFilter = '_id avatar nickname'

exports.getSingle = async (req, res) => {
  const userId = req.userId
  const { momentId } = req.query
  Moment.findMoments(userId, { _id: momentId }).then(result => {
    res.json(resFormat({
      success: 1,
      data: result
    }))
  }).catch(err => {
    res.json(resFormat({
      success: 1,
      msg: err
    }))
  })
  
}

// 获取微博
exports.get = async (req, res) => {
  const userId = req.userId || ''
  const page = parseInt(req.query.page)
  const size = parseInt(req.query.size)
  const { targetId } = req.query
  let filter
  switch (req.query.flag) {
    case 'latest':
      filter = {}
      break
    case 'myFollows':
      const result = await User.findById(userId, 'follows')
      filter = { author: { $in: result.follows}}
      break
    case 'myMoments':
      filter = {author: userId}
      break
    case 'targetMoments':
      filter = { author: targetId }
      break
    case 'likeMoments':
      filter = { likes: { $elemMatch: { $eq: targetId} } }
      break
    default:
      filter = {}
      break;
  }
  const result = await Moment.findMoments(userId, filter, page, size)
  res.send(resFormat({
    success: 1,
    data: result
  }))
}

// 发布微博
exports.post = async (req, res) => {
  const userId = req.userId
  const withFlag = req.query['withFlag']
  const userInfo = await User.findById(userId, posterInfoFilter)

  let resultFields = {}
  let resultFiles = {}
  
  let inComing = new formidable.IncomingForm()
  inComing.hash = 'md5'
  inComing.multiples = true

  let uploadPrms = new Promise((resolve, reject) => {
    if (withFlag === 'images') {
      inComing.uploadDir = CONFIG.sourceImgPath
      inComing.parse(req, (err, fields, files) => {
        if (err) { reject(err) }
        resultFields = { ...fields }
        resultFiles = renameFormFiles(files, userId, withFlag)
        resolve()
      })
    } else if (withFlag === 'video') {
      inComing.uploadDir = CONFIG.sourceMediaPath
      inComing.parse(req, (err, fields, files) => {
        if (err) { reject(err) }
        resultFields = { ...fields }
        resultFiles = renameFormFiles(files, userId, withFlag)
        resolve()
      })
    }
  })
  
  uploadPrms.then(async () => {
    const transformOption = await _common.transformAtAndTopic(resultFields.content.slice(0, 250))
    // new moment doc
    let newMoment = new Moment({
      author: mongoose.Types.ObjectId(userInfo._id),
      content: transformOption.content,
      images: resultFiles['images'] ? addPrefixURI(resultFiles['images']) : [],
      video: resultFiles['video'] ? addPrefixURI(resultFiles['video'][0]) : '',
      // created_at: +new Date()
    })

    // 保存数据库
    newMoment.save().then(result => {
      _common.handleTopicInMoment(transformOption.topics)
      _common.genNotification(transformOption.targetUsers, {
        flag: 'moment_mention',
        from_id: userInfo._id,
        from_name: userInfo.nickname,
        origin_moment: result._id
      })
      res.json(resFormat({
        success: 1,
        msg: '发布成功！',
        data: {
          avatar: userInfo.avatar,
          nickname: userInfo.nickname,
          ...result._doc
        }
      }))
    })
  }).catch(err => {
    res.status(500).json(resFormat({
      msg: err.message
    }))
  })

}

// 点赞微博
exports.like = async (req, res) => {
  const userId = req.userId
  const { momentId, flag } = req.body
  if (flag === 'cancel') {
    await User.findByIdAndUpdate(userId, { $pull: { likes: momentId } })
    await Moment.findByIdAndUpdate(momentId, { $pull: { likes: userId } })
  } else {
    
    const userInfo = await User.findByIdAndUpdate(userId, { $push: { likes: momentId } })
    Moment.findByIdAndUpdate(momentId, { $push: { likes: userId } }).then(result => {
      _common.genNotification([result.author], {
        flag: 'like',
        from_id: userInfo._id,
        from_name: userInfo.nickname,
        origin_moment: result._id
      })
    })
  }
  res.send(resFormat({
    success: 1,
    msg: '操作成功！'
  }))
}

// 搜索微博
exports.search = async (req, res) => {
  const userId = req.userId
  let { keyword, page, size } = req.query
  let filter = { content: new RegExp(keyword) }
  page = parseInt(page) || 1
  size = parseInt(size) || 15

  _common.handleTopicInSearch(keyword)

  const result = await Moment.findMoments(userId, filter, page, size)
  res.send(resFormat({
    success: 1,
    data: result,
    msg: '搜索成功！'
  }))
}


// 删除微博
exports.delete = (req, res) => {
  const momentId = req.query.id
  Moment.findByIdAndRemove(momentId, (err, query) => {

    res.json(resFormat({
      success: 1,
      msg: '删除成功！',
      data: query
    }))

    // 清楚旧资源
    query.images.forEach(item => {
      const imgName = path.basename(item)
      fs.unlink(CONFIG.sourceImgPath + imgName, err => {
        err && console.log('删除动态信息图片失败: ' + imgName)
      })
    })

    query.video && fs.unlink(CONFIG.sourceImgPath + path.basename(query.video), err => {
      err && console.log('删除动态信息视频失败: ' + path.basename(query.video))
    })
  })
}