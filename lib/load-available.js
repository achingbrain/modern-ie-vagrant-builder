const browser = require('./browser')

module.exports = (emitter) => {
  emitter.emit('vm:list:loading')

  browser(browser => {
    browser.url('https://developer.microsoft.com/en-us/microsoft-edge/tools/vms/')
    .then(() => {
      browser.execute(function () {
        const vms = []
        const nodes = Array.prototype.slice.call(document.getElementById('select-vm').childNodes, 1)

        for (var i = 0; i < nodes.length; i++) {
          vms.push(nodes[i].value)
        }

        return vms
      })
      .then(result => emitter.emit('vm:list:loaded', result.value))
      .catch(error => emitter.emit('error', error))
    })
    .catch(error => emitter.emit('error', error))
  })
}
