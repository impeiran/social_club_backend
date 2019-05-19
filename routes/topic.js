const express = require('express')
const router = express.Router()

const Topic = require('../controllers/c-topic')

router.get('/api/topic/trending', Topic.getTrendingTopic)

module.exports = router