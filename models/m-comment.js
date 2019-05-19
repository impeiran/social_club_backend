const mongoose = require('mongoose')
const Schema = mongoose.Schema

const comment = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'user' },
  content: { type: String, required: true },
  sub_comments: [{ type: Schema.Types.ObjectId, ref: 'subcomment' }],
  created_at: { type: Date, default: Date.now }
}, {
  versionKey: false
})

module.exports = mongoose.model('comment', comment)
