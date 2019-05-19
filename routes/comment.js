const express = require('express')
const router = express.Router()

const Comment = require('../controllers/c-comment')

router.get('/api/moment/comment', Comment.get)
router.post('/api/moment/comment', Comment.post)
router.post('/api/moment/comment/sub', Comment.subPost)
router.delete('/api/moment/comment', Comment.delete)
router.delete('/api/moment/comment/sub', Comment.subDelete)

module.exports = router