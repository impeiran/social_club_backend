const resFormat = require('../utils/res-formatter')
const Notification = require('../models/m-notification')

exports.getUnRead = async (req, res) => {
  const userId = req.userId
  const unReadList = await Notification.find({ target: userId, hasRead: false }).sort({ created_at: -1 })
  res.json(resFormat({
    success: 1,
    data: unReadList || []
  }))
}

exports.getHasRead = async (req, res) => {
  const userId = req.userId
  const hasReadList = await Notification.find({ target: userId, hasRead: true }).sort({ created_at: -1 })
  res.json(resFormat({
    success: 1,
    data: hasReadList || []
  }))
}

exports.readMessage = async (req, res) => {
  const { id } = req.body
  const data = await Notification.updateMany({_id: { $in: id }}, { hasRead: true })
  res.json(resFormat({
    success: 1,
    data,
    msg: '读取成功'
  }))
}

exports.clearMessage = async (req, res) => {
  const userId = req.userId
  await Notification.deleteMany({ target: userId })
  res.json(resFormat({
    success:1,
    msg: '清除成功'
  }))
}