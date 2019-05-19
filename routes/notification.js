const express = require('express')
const router = express.Router()

const Notification = require('../controllers/c-notification')

router.get('/api/notification/unRead', Notification.getUnRead)
router.get('/api/notification/hasRead', Notification.getHasRead)
router.post('/api/notification/read', Notification.readMessage)
router.delete('/api/notification/clear', Notification.clearMessage)
module.exports = router