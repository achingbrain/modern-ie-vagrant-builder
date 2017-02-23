const browser = require('./browser')
const promiseRetry = require('promise-retry')
const MAX_RETRIES = 10

const findDownloadLink = vm => {
  return new Promise((resolve, reject) => {
    browser(browser => {
      browser.url('https://developer.microsoft.com/en-us/microsoft-edge/tools/vms/')
      .then(() => browser.waitForVisible(`#select-vm option[value="${vm}"]`))
      .then(() => browser.selectByValue('#select-vm', vm))
      .then(() => browser.waitForVisible('#select-vm-platform option[value="Vagrant"]'))
      .then(() => browser.selectByValue('#select-vm-platform', 'Vagrant'))
      .then(() => browser.waitForVisible('#js-download'))
      .then(() => browser.getAttribute('#js-download', 'href'))
      .then(url => resolve(url))
      .catch(error => reject(error))
    })
  })
}

module.exports = (emitter, vm) => {
  emitter.emit('vm:link:load', {
    vm
  })

  return promiseRetry((retry, attempt) => {
    if (attempt > 1) {
      emitter.emit('vm:link:retry', {
        vm, attempt,
        max: MAX_RETRIES
      })
    }

    return findDownloadLink(vm)
    .then(link => {
      emitter.emit('vm:link:loaded', {
        vm, link
      })

      return link
    })
    .catch(retry)
  }, {
    retries: MAX_RETRIES,
    factor: 1
  })
  .catch(error => {
    emitter.emit('error', error)
  })
}
