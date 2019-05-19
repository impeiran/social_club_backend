const mongoose = require('mongoose')
const Schema = mongoose.Schema

const user = new Schema({
  account: { type: String, required: true },
  password: { type: String, required: true },
  nickname: { type: String, required: true },
  sex: { type: Number, required: true },
  avatar: { type: String, default: '' },
  desc: { type: String, default: '' },
  follows: [{ type: Schema.Types.ObjectId, ref: 'user' }],
  fans: [{ type: Schema.Types.ObjectId, ref: 'user' }],
  likes: [{ type: Schema.Types.ObjectId, ref: 'moments' }],
  created_at: { type: Date, default: Date.now }
}, { versionKey: false })

user.statics.getInfo = async function (field, myId, projection = '-account -password') {
  const info = await this.findOne(field, projection)
  if (info) {
    let newInfo = {
      id: info._id,
      avatar: info.avatar,
      desc: info.desc,
      sex: info.sex,
      nickname: info.nickname,
      created_at: info.created_at,
      fans_num: info.fans.length,
      follows_num: info.follows.length,
    }

    if (myId !== 'visitor') {
      newInfo.hasFollowed = info.fans.indexOf(myId) !== -1
    }
    return newInfo 
  } else {
    return null
  }
  
}

user.statics.getByPopulate = async function (userId, targetId, field = '', page = 1, size = 15) {
  const infos = await this.findById(targetId, field)
    .populate({
      path: field,
      select: '-account -password -follows -likes'
    })
    .skip((page - 1) * size)
    .limit(size)
  return infos[field].map(item => {
    let newItem = JSON.parse(JSON.stringify(item))
    if (userId !== 'visitor') {
      newItem.hasFollowed = newItem.fans.indexOf(userId) !== -1
    }
    delete newItem.fans
    return newItem
  })
}

user.statics.checkIsFollowed = async function (user, target) {
  const fans = await this.find({_id: target}, 'fans')
  return fans && fans.length ? fans.indexOf(user) !== -1 : false
}


module.exports = mongoose.model('user', user)
