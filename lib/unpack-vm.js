const unzip = require('unzipper')
const fs = require('fs')
const path = require('path')

module.exports = (emitter, vm, source) => {
  emitter.emit('vm:unpack:start', {
    vm, source
  })

  const target = path.join(path.dirname(source), `${path.basename(source, '.zip')}.box`)

  fs.createReadStream(source)
  .pipe(unzip.Parse())
  .on('entry', function (entry) {
    const fileName = entry.path
    const type = entry.type
    const size = entry.size

    if (fileName.substring(fileName.length - 4) === '.box') {
      emitter.emit('vm:unpack:unpacking', {
        vm, target,
        file: entry.path,
        type: entry.type,
        size: entry.size
      })

      entry.pipe(fs.createWriteStream(target))
      .on('finish', () => {
        emitter.emit('vm:unpack:success', {
          vm, target, source
        })
      })
      .on('error', error => {
        emitter.emit('error', error)
      })
    } else {
      entry.autodrain();
    }
  })
}
