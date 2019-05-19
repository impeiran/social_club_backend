const express = require('express')
const router = express.Router()
const svgCaptcha = require('svg-captcha')
const path = require('path')
const fs = require('fs')

router.get('/api/social_captcha', (req, res) => {
  const captcha = svgCaptcha.create()
  res.set(
    'content-Type', 'image/svg+xml')
  req.session.captcha = captcha.text
  res.send(captcha.data)
})

// router.get('/api/social_sources/img/:img', (req, res) => {
//   res.sendFile(path.join(__dirname, '../sources/img/' + req.params.img))
// })

// router.get('/api/social_sources/media/:video', (req, res) => {
//   const mediaPath = path.join(__dirname, '../sources/media/' + req.params.video)
//   const stat = fs.statSync(mediaPath)
//   const fileSize = stat.size
//   const range = req.headers.range
//   if (range) {
//     const parts = range.replace(/bytes=/, "").split("-")
//     const start = parseInt(parts[0], 10)
//     const end = parts[1]
//       ? parseInt(parts[1], 10)
//       : fileSize - 1

//     const chunksize = (end - start) + 1
//     const file = fs.createReadStream(mediaPath, { start, end })
//     const head = {
//       'Content-Range': `bytes ${start}-${end}/${fileSize}`,
//       'Accept-Ranges': 'bytes',
//       'Content-Length': chunksize,
//       'Content-Type': 'video/mp4',
//     }

//     res.writeHead(206, head)
//     file.pipe(res)
//   } else {
//     const head = {
//       'Content-Length': fileSize,
//       'Content-Type': 'video/mp4',
//     }
//     res.writeHead(200, head)
//     fs.createReadStream(mediaPath).pipe(res)
//   }
// })

module.exports = router