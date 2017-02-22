const browser = require('./browser')
const promiseRetry = require('promise-retry')

const findDownloadLink = (title) => {
  return new Promise((resolve, reject) => {
    browser(browser => {
      browser.url('https://developer.microsoft.com/en-us/microsoft-edge/tools/vms/')
      .then(() => browser.waitForVisible(`#select-vm option[value="${title}"]`))
      .then(() => browser.click(`#select-vm option[value="${title}"]`))
      .then(() => browser.waitForVisible('#select-vm-platform option[value="Vagrant"]'))
      .then(() => browser.click('#select-vm-platform option[value="Vagrant"]'))
      .then(() => browser.waitForVisible('#js-download'))
      .then(() => browser.getAttribute('#js-download', 'href'))
      .then(url => resolve(url))
      .catch(error => reject(error))
    })
  })
}

module.exports = (emitter, title) => {
  emitter.emit('vm:link:load', title)

  return promiseRetry((retry, attempt) => {
    if (attempt > 1) {
      emitter.emit('vm:link:retry', title, attempt)
    }

    return findDownloadLink(title)
    .then(link => {
      emitter.emit('vm:link:loaded', title, link)

      return link
    })
    .catch(retry)
  })
}
