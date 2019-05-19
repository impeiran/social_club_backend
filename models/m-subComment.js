const mongoose = require('mongoose')
const Schema = mongoose.Schema

const subComment = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'user' },
  replyto: { type: Schema.Types.ObjectId, ref: 'user' },
  content: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
}, {
  versionKey: false
})

module.exports = mongoose.model('subcomment', subComment)
