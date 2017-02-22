const fs = require('fs')
const request = require('request')
const progress = require('request-progress')
const os = require('os')
const path = require('path')

module.exports = (emitter, vm, link) => {
  emitter.emit('vm:download:start', vm, link)

  const outputFile = path.join(os.tmpdir(), path.basename(link))

  progress(request(link))
  .on('progress', state => {
      emitter.emit('vm:download:progress', vm, link, state)
  })
  .on('error', error => {
      emitter.emit('error', error)
  })
  .on('end', () => {
      emitter.emit('vm:download:success', vm, link, outputFile)
  })
  .pipe(fs.createWriteStream(outputFile))
}
