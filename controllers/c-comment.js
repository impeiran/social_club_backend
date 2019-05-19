const resFormat = require('../utils/res-formatter')
const _common = require('./_common')

const Moment = require('../models/m-moment')
const User = require('../models/m-user')
const Comment = require('../models/m-comment')
const subComment = require('../models/m-subComment')

exports.get = (req, res) => {
  let { momentId, page, size } = req.query
  page = page ? parseInt(page) : 1
  size = size ? parseInt(size) : 10
  Moment.findById(momentId, 'comments')
    .populate({
      path: 'comments',
      populate: { path: 'author', select: 'avatar nickname' }
    })
    .populate({
      path: 'comments',
      populate: {
        path: 'sub_comments',
        populate: {
          path: 'author',
          select: 'avatar nickname'
        }
      }
    })
    .then(result => {
      const skip = (page - 1) * size
      res.send(resFormat({
        success: 1,
        msg: '查找评论成功！',
        data: result.comments.slice(skip, skip + size)
      }))
    })

}

exports.post = async (req, res) => {
  const userId = req.userId
  const { momentId, content } = req.body
  const transformOption = await _common.transformAtAndTopic(content.slice(0, 100), true)
  const newComment = await new Comment({
    author: userId,
    content: transformOption.content,
  }).save()
  Moment.findByIdAndUpdate(momentId, {
    $push: {
      comments: newComment._id
    }
  }, { new: true }).then(result => {
    result.author.toHexString() !== newComment.author.toHexString() && User.findById(newComment.author).then(user => {
      _common.genNotification(transformOption.targetUsers, {
        flag: 'comment_mention',
        from_id: user._id,
        from_name: user.nickname,
        origin_moment: result._id
      })
      _common.genNotification([result.author], {
        flag: 'moment_comment',
        from_id: user._id,
        from_name: user.nickname,
        origin_moment: result._id
      })
    })
    
    res.send(resFormat({
      success: 1,
      data: newComment,
      msg: '评论成功！'
    }))
  })
}

exports.subPost = async (req, res) => {
  const userId = req.userId
  const { commentId, content, momentId } = req.body
  const transformOption = await _common.transformAtAndTopic(content.slice(0, 100), true)
  const newSubComment = await new subComment({
    author: userId,
    content: transformOption.content
  }).save()
  Comment.findByIdAndUpdate(commentId, {
    $push: {
      sub_comments: newSubComment._id
    }
  }).then(result => {
    result.author.toHexString() !== newSubComment.author.toHexString() && User.findById(newSubComment.author).then(user => {
      _common.genNotification(transformOption.targetUsers, {
        flag: 'comment_reply',
        from_id: user._id,
        from_name: user.nickname,
        origin_moment: momentId
      })
      _common.genNotification([result.author], {
        flag: 'comment_reply',
        from_id: user._id,
        from_name: user.nickname,
        origin_moment: momentId
      })
    })
    res.send(resFormat({
      success: 1,
      data: newSubComment,
      msg: '回复评论成功'
    }))
  })
}

exports.delete = async (req, res) => {
  const {momentId, commentId} = req.query
  await Moment.findByIdAndUpdate(momentId, {
    $pull: {
      comments: commentId
    }
  })
  await Comment.findByIdAndDelete(commentId)
  res.send(resFormat({
    success: 1,
    msg: '删除成功！'
  }))
}

exports.subDelete = async (req, res) => {
  const { commentId, subCommentId } = req.query
  await Comment.findByIdAndUpdate(commentId, {
    $pull: {
      sub_comments: subCommentId
    }
  })
  await subComment.findByIdAndDelete(subCommentId)
  res.send(resFormat({
    success: 1,
    msg: '删除成功！'
  }))
}