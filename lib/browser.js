const webdriverio = require('webdriverio')
const wdOpts = { desiredCapabilities: { browserName: 'phantomjs' } }
const phantomjs = require('phantomjs-prebuilt')

module.exports = (withBrowser) => {
  return phantomjs
  .run('--webdriver=4444')
  .then(program => {
    const browser = webdriverio
      .remote(wdOpts)
      .init()

    withBrowser(browser)
    .then(result => {
      program.kill()

      return result
    })
    .catch(error => {
      program.kill()

      throw error
    })
  })
}
