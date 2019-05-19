const resFormat = require('../utils/res-formatter')
const Topic = require('../models/m-topic')

exports.getTrendingTopic = async (req, res) => {
  res.json(resFormat({
    success: 1,
    data: await Topic.find().sort({ score: -1 }).limit(10)
  }))
}