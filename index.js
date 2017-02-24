
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

emitter.on('vm:selected', event => {
  getDownloadLink(emitter, event.vm)
})

emitter.on('vm:link:loaded', event => {
  downloadVm(emitter, event.vm, event.link)
})

emitter.on('vm:download:success', event => {
  unpackVm(emitter, event.vm, event.target)
})

emitter.on('vm:unpack:success', event => {
  console.info('')
  console.info(`VM '${event.vm}' unpacked.  To add to vagrant, run:`)
  console.info('')
  console.info(`vagrant box add ${event.target} --name='${event.vm}'`)
  console.info('')
  console.info('You can then log in with the credentials:')
  console.info('')
  console.info('User:      IEUser')
  console.info('Password:  Passw0rd!')
  console.info('')
  console.info('You can then remove both files:')
  console.info(event.source)
  console.info(event.target)
  console.info('')
  console.info('A basic VagrantFile might look like this:')
  console.info('')
  console.info('# -*- mode: ruby -*-')
  console.info('# vi: set ft=ruby :')
  console.info('')
  console.info('Vagrant.configure(2) do |config|')
  console.info(`  config.vm.box = "${event.vm}"`)
  console.info('')
  console.info('  config.vm.provider "virtualbox" do |vm|')
  console.info('    vm.gui = true')
  console.info('    vm.memory = "2048"')
  console.info('  end')
  console.info('end')
  console.info('')

  process.exit(0)
})

emitter.on('error', error => {
  console.error(error.stack || error.message || error)

  process.exit(1)
})

loadAvailable(emitter)
