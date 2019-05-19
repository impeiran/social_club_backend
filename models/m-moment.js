const mongoose = require('mongoose')
const Schema = mongoose.Schema

const moments = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'user' },
  content: { type: String },
  images: { type: Array, default: [] },
  video: { type: String, default: '' },
  likes: [{ type: Schema.Types.ObjectId, ref: 'user' }],
  comments: [{ type: Schema.Types.ObjectId, ref: 'comment' }],
  created_at: { type: Date, default: Date.now }
}, {
  versionKey: false
})

moments.statics.getTargetBlogNums = async function (targetId) {
  const moments = await this.find({author: targetId}, '_id')
  return moments.length
}

moments.statics.findMoments = async function (user, filter, page = 1, size = 15) {
  // 筛选document
  const filteItem = item => {
    let newItem = JSON.parse(JSON.stringify(item))
    let comments_count = newItem.comments.length
    newItem.comments.forEach(item => {
      comments_count += item.sub_comments.length
    })
    newItem.comments_num = comments_count
    newItem.likes_num = newItem.likes.length
    if (user && user !== newItem.author._id) {
      newItem.author.hasFollowed = newItem.author.fans.indexOf(user) !== -1
    }
    if (user && user !== 'visitor') {
      newItem.hasLiked = newItem.likes.indexOf(user) !== -1
    }
    delete newItem.comments
    delete newItem.likes
    delete newItem.author.fans
    return newItem
  }

  // 查询操作
  const result = await this.find(filter)
    .sort({ created_at: -1 })
    .populate('author', 'avatar nickname fans')
    .populate('comments')
    .skip((page - 1) * size)
    .limit(size)

  return Array.isArray(result) ? result.map(filteItem) : filteItem(result)
}

module.exports = mongoose.model('moment', moments)
