const { readdirSync, createWriteStream } = require('fs')
const { spawn, execFile } = require('child_process')
const gifsicle = require('gifsicle')
const sharp = require('sharp')

sharp('./public/assets/images/giveaway.jpg')
  .resize(768)
  .toFile('output.jpg', (err, info) => {
    console.log(err, info)
  })

readdirSync('./public/assets/gifs/source').forEach((path) => {
  const stream = spawn(gifsicle, [
    '--resize-fit-width',
    '640',
    `./public/assets/gifs/source/${path}`,
  ])

  stream.stdout.pipe(createWriteStream(`./public/assets/gifs/${path}`))

  // execFile(
  //   gifsicle,
  //   [
  //     '--resize-fit-width',
  //     '640',
  //     '-o',
  //     `./public/assets/gifs/${path}`,
  //     `./public/assets/gifs/source/${path}`,
  //   ],
  //   (err) => {
  //     if (err) {
  //       throw err
  //     }
  //   }
  // )
})
