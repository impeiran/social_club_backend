const sources = require('./sources')
const authMiddleware = require('./auth')
const user = require('./user')
const moment = require('./moment')
const comment = require('./comment')
const notification = require('./notification')
const topic = require('./topic')

module.exports = app => {
  app.use(sources)
  app.use(authMiddleware)
  app.use(user)
  app.use(moment)
  app.use(comment)
  app.use(notification)
  app.use(topic)
}
