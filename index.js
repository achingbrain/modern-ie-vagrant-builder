
const blessed = require('blessed')
const pkg = require('./package.json')
const ui = require('./lib/ui')
const loadAvailable = require('./lib/load-available')
const downloadVm = require('./lib/download-vm')
const unpackVm = require('./lib/unpack-vm')
const getDownloadLink = require('./lib/get-download-link')
const EventEmitter = require('events').EventEmitter;
const emitter = new EventEmitter()

ui(emitter)

emitter.on('vm:selected', vm => {
  getDownloadLink(emitter, vm)
})

emitter.on('vm:link:loaded', (vm, link) => {
  downloadVm(emitter, vm, link)
})

emitter.on('vm:download:success', (vm, file) => {
  unpackVm(emitter, vm, file)
})

emitter.on('vm:unpack:success', (vm, file) => {
  //downloadVm(emitter, vm, link)
})

emitter.on('error', error => {
  console.error(error)
})

loadAvailable(emitter)
