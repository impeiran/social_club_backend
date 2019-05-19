const mongoose = require('mongoose')
const Schema = mongoose.Schema

const topic = new Schema({
  title: { type: String, required: true },
  score: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
}, {
  versionKey: false
})

module.exports = mongoose.model('topic', topic)
