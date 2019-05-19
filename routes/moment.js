const express = require('express')
const router = express.Router()

const Moment = require('../controllers/c-moment')

router.get('/api/moment', Moment.get)
router.delete('/api/moment', Moment.delete)
router.post('/api/moment', Moment.post)
router.get('/api/moment/search', Moment.search)
router.get('/api/moment/single', Moment.getSingle)
router.post('/api/moment/like', Moment.like)

module.exports = router