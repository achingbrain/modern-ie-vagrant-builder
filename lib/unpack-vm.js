
module.exports = (emitter, vm, link) => {
  console.info('emitting', 'vm:unpack:start', vm, link)
  emitter.emit('vm:unpack:start', vm, link)
}
