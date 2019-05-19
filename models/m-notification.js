const mongoose = require('mongoose')
const Schema = mongoose.Schema

const notification = new Schema({
  type: { type: String, required: true },
  target: { type: Schema.Types.ObjectId, ref: 'user' },
  option: { type: String, default: '' },
  hasRead: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
}, {
  versionKey: false
})

module.exports = mongoose.model('notification', notification)
