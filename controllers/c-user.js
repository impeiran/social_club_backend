const md5 = require('blueimp-md5')
const jwt = require('jsonwebtoken')
const resFormat = require('../utils/res-formatter')
const CONFIG= require('../config')

const User = require('../models/m-user')
const Moment = require('../models/m-moment')

// 快速登陆
exports.quickSignIn = async (req, res) => {
  const userId = req.userId
  const info = await User.getInfo({ _id: userId})
  const moments_num = await Moment.getTargetBlogNums(userId)
  res.json(resFormat({
    success: 1,
    data: {
      ...info,
      moments_num
    }
  }))
}

// 账号密码登陆
exports.signIn = async (req, res) => {
  const { account, password, captcha } = req.body
  // console.log(req.session)
  if (!req.session.captcha || !captcha) {
    return res.status(401).json(resFormat({
      msg: '缺少验证'
    }))
  }
  if (req.session.captcha.toLowerCase() != captcha.toLowerCase()) {
    return res.json(resFormat({
      msg: '验证码错误'
    }))
  }
  User.findOne({
    account,
    password: md5(password, CONFIG.secret),
  }, '-account -password')
  .then(async result => {

    // 账号密码不匹配
    if (!result) {
      res.json(resFormat({
        msg: '账号密码错误或账号不存在'
      }))
    } else {
      // 获取动态数量
      const moments_num = await Moment.getTargetBlogNums(result._id)

      // token签名
      const tokenSplit = jwt.sign({
          id: result._id,
          password: result.password 
      }, CONFIG.secret, { expiresIn: CONFIG.tokenExpire }).split('.')

      // 返回信息
      res.json(resFormat({
        success: 1,
        data: {
          id: result._id,
          avatar: result.avatar,
          desc: result.desc,
          nickname: result.nickname,
          created_at: result.created_at,
          sex: result.sex,
          fans_num: result.fans.length,
          follows_num: result.follows.length,
          likes_num: result.likes.length,
          moments_num,
          token: tokenSplit[1] + '.' + tokenSplit[2]
        },
        msg: '登陆成功！'
      }))
    }
  })
  .catch(err => {
    res.json(resFormat({
      success: 0,
      msg: err.message
    }))
  })
}

// 注册账号
exports.signUp = async (req, res) => {
  const { account, password, sex, nickname, captcha } = req.body
  // console.log('debug session: ' + req.session.captcha)
  if (!req.session.captcha || !captcha) {
    return res.json(resFormat({
      msg: '缺少验证'
    }))
  }

  if (req.session && req.session.captcha.toLowerCase() != captcha.toLowerCase()) {
    return res.json(resFormat({
      msg: '验证码错误'
    }))
  }

  // 信息验证
  if (!/^[a-zA-Z]/.test(account) || !/^[a-zA-Z0-9]{3， 20}/) {
    return res.json(resFormat({ msg: '账号格式必须为首字母开头，由字母与数字组成，长度4到20位' }))
  }
  if (password.length < 6) {
    return res.json(resFormat({ msg: '密码至少要求6位' }))
  }
  if (await User.findOne({ account })) {
    console.log(await User.find({ account }))
    return res.json(resFormat({ msg: '该账号已被注册，请重新输入' }))
  }
  if (await User.findOne({ nickname })) {
    return res.json(resFormat({ msg: '该昵称已被注册，请重新输入' }))
  }


  let newUser = new User({
    account,
    password: md5(password, CONFIG.secret),
    sex,
    nickname,
  })
  newUser.save(err => {
    if(err)  return res.status(500).json(resFormat({ msg: err.message}))
    User.findOne({ account: req.body.account }, '_id', (err, result) => {
      const token = jwt.sign({
        id: result._id,
        password: result.password
      }, CONFIG.secret, { expiresIn: CONFIG.tokenExpire })
      const tokenSplit = token.split('.')
      res.json(resFormat({
        success: 1,
        data: { token: tokenSplit[1] + '.' + tokenSplit[2] },
        msg: '注册成功！'
      }))
    })
  })
}