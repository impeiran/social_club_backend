const _String = require('lodash/string')
const wsServer = require('../ws-server')
const User = require('../models/m-user')
const Notification = require('../models/m-notification')
const Topic = require('../models/m-topic')

const AT_TOPIC_REG = /(@[\u4e00-\u9fa5a-zA-Z0-9_-]*\s?)|(#[\u4e00-\u9fa5a-zA-Z0-9_-]*#)/g
const TOPIC_REG = /#[\u4e00-\u9fa5a-zA-Z0-9_-]*#/g

exports.getTopics = content => {
  const result = content.match(TOPIC_REG) || []
  return Array.from(new Set(result.map(item => {
    return item.replace(/#/g, '')
  })))
}

exports.transformAtAndTopic = async (content, noTopic = false) => {
  const contentMatch = content.match(AT_TOPIC_REG) || []

  let hasResolvedName = []
  let targetUsers = []
  let topics = []
  content = _String.escape(content.trim())
  for (let val of contentMatch) {
    const item = val.trim()

    // 艾特转换
    if (item.charAt(0) === '@') {
      if (hasResolvedName.indexOf(item.slice(1)) !== -1) continue
      const targetInfo = await User.getInfo({ nickname: item.slice(1) })
      if (targetInfo && targetInfo.id) {
        const transformName = `<a href="/user?id=${targetInfo.id}">${item}</a>`
        content = content.replace(new RegExp(item, 'g'), transformName)
        targetUsers.push(targetInfo.id)
      }
      hasResolvedName.push(item)
    }
    
    // 话题转换
    else if (item.charAt(0) === '#' && !noTopic) {
      const topic = item.replace(new RegExp('#', 'g'), '')
      if (topics.indexOf(topic) !== -1 ) continue
      const topicTemplate = `<a href="/search?kw=%23${_String.escape(topic)}%23">${item}</a>`
      topics.push(topic)
      content = content.replace(new RegExp(item, 'g'), topicTemplate)
    }
  }
  return {
    targetUsers,
    topics,
    content
  }
}

exports.genNotification = async (userId, info) => {
  let notifications = []
  if (userId instanceof Array) {
    userId.forEach(item => {
      notifications.push(new Notification({
        type: 'information',
        target: item,
        option: JSON.stringify(info)
      }))
    })
    const newNotifications = await Notification.insertMany(notifications)
    newNotifications.forEach(item => {
      wsServer.notificateUser(item.target, item)
    })
  } else {
    const newNotification = await new Notification({
      type: 'information',
      target: userId,
      option: JSON.stringify(info)
    }).save()
    wsServer.notificateUser(userId, newNotification)
  }
}

exports.handleTopicInMoment = async (topics, incScore = 1) => {
  topics.forEach(item => {
    Topic.findOneAndUpdate({ title: item }, { $inc: { score: incScore } }, {new: true}, (err, result) => {
      !result && new Topic({
        title: item,
        score: 1
      }).save()
    })
  })
}

exports.handleTopicInSearch = keyword => {
  Topic.findOneAndUpdate({ title: keyword }, { $inc: { score: 1 } }, { new: true }, (err, result) => {
  })
}