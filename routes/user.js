const express = require('express')
const router = express.Router()

const User = require('../controllers/c-user')
const UserInfo = require('../controllers/c-userInfo')

router.post('/api/signIn', User.signIn)
router.post('/api/signIn/quick', User.quickSignIn)
router.post('/api/signUp', User.signUp)

router.get('/api/user/search', UserInfo.search)
router.get('/api/user/info', UserInfo.getInfo)
router.get('/api/user/info/follows', UserInfo.getInfoFollows)
router.get('/api/user/info/fans', UserInfo.getInfoFans)
router.post('/api/user/editInfo', UserInfo.Edit)
router.post('/api/user/follow', UserInfo.followUser)
module.exports = router