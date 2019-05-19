const express = require('express')
const wsServer = require('./ws-server')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const compression = require('compression')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const morgan = require('morgan')
const chalk = require('chalk')
const router = require('./routes')
const CONFIG = require('./config')
const resFormat = require('./utils/res-formatter')
const { exec } = require('child_process')

const app = new express()

mongoose.set('useFindAndModify', false)
mongoose.connect(CONFIG.db, { useNewUrlParser: true }, (err) => {
  if (err) {
    console.log(chalk.red('[social-club] connect db failed'))
  } else {
    console.log(chalk.green('[social-club] connect db successfully'))
  }
})

// app.all('*', (req, res, next) => {
//   const { origin, Origin, referer, Referer } = req.headers
//   const allowOrigin = origin || Origin || referer || 'impeiran.com'
//   res.header('Access-Control-Allow-Origin', allowOrigin)
//   res.header('Access-Control-Allow-Credentials', true)
//   res.header('Access-Control-Allow-Headers', 'Authorization,Content-Type,Cache-Control')
//   res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE, PUT')
//   next()
// })

app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.set('trust proxy', 1)
app.use(cookieParser())
app.use(session({
  secret: CONFIG.secret,
  name: 'mysocialclub',
  resave: true,
  saveUninitialized: true,
  cookie: {
    // path: '*',
    domain: '.impeiran.com',
    secure: false,
    maxAge: 60 * 1000 * 60 * 24
  }
}))
app.use(compression())

app.use(express.static('./public'))

router(app)

app.use((err, req, res, next) => {
  chalk.red(err)
  return res.status(500).json(resFormat({msg: err}))
})

app.get('*', (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
})

// 主服务
app.listen(CONFIG.port, '0.0.0.0',() => {
  const url = `http://localhost:${CONFIG.port}`
  console.log(chalk.blue('[social-club] Application is running at ' + chalk.underline(url)))
  CONFIG.autoOpen && exec('start ' + url)

  // websocket 服务
  app.wsServer = wsServer.create({
    port: CONFIG.wsPort,
    info: chalk.green('[social-club] Application wsServer is ready')
  })
})
