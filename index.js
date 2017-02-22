/*var fs = require('fs');
var page = require('webpage').create();

const phantomjs = require('phantomjs-prebuilt')

page.open('https://www.modern.ie/en-us/virtualization-tools', function(status) {

	console.log("Status: " + status);

	var data = page.evaluate(function() {
		return window.vmListJSON;
	});

	var json = JSON.stringify(data, null, 2);

	console.log(fs);

	fs.write("result.json", json, "w");

	phantom.exit();
});

*/

var phantomjs = require('phantomjs-prebuilt')
var webdriverio = require('webdriverio')
var wdOpts = { desiredCapabilities: { browserName: 'phantomjs' } }

const arrayify = list => Array.prototype.slice.apply(list, 0)

phantomjs.run('--webdriver=4444').then(program => {

  const browser = webdriverio
    .remote(wdOpts)
    .init()
    .url('https://www.modern.ie/en-us/virtualization-tools')


  browser.execute(function () {
      const vms = []

      return arrayify(document.getElementById('select-vm').childNodes)

      return Array.prototype.slice.apply(, 1)


  })
  .then(result => {
      console.info('here are the things')
      console.info(result)
  })
  .catch(error => {
    console.info('nope!')
    console.info(error)
  })
  .then(() => {
    program.kill() // quits PhantomJS
  })



})
