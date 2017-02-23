const fs = require('fs')
const request = require('request')
const progress = require('request-progress')
const os = require('os')
const path = require('path')

module.exports = (emitter, vm, source) => {
  emitter.emit('vm:download:start', vm, source)

  const target = path.join(os.tmpdir(), path.basename(source))

  progress(request(source))
  .on('progress', progress => {
      emitter.emit('vm:download:progress', {
        vm, source, progress, target
      })
  })
  .on('error', error => {
      emitter.emit('error', error)
  })
  .on('end', () => {
      emitter.emit('vm:download:success', {
        vm, source, target
      })
  })
  .pipe(fs.createWriteStream(target))
}
