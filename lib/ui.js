
const blessed = require('blessed')
const pkg = require('../package.json')
const prettySize = require('pretty-size')
const moment = require('moment')

let loading, statusBox, progressBar;

const screen = blessed.screen({
  smartCSR: true,
  title: pkg.name
})

var box = blessed.box({
  top: 'center',
  left: 'center',
  width: '50%',
  height: '50%',
  tags: true,
  border: {
    type: 'line'
  },
  style: {
    fg: 'white',
    bg: 'blue',
    border: {
      fg: 'white'
    }
  }
})

screen.append(box);
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
})

box.focus()
screen.render();

module.exports = emitter => {
  loading = blessed.loading({
    parent: box,
    style: {
      fg: 'white',
      bg: 'blue'
    }
  })

  emitter.on('vm:list:loading', () => {
    box.setLabel('Choose a VM')
    loading.load('Loading available VMs')

    screen.render();
  })

  emitter.on('vm:list:loaded', vms => {
    box.setLabel('Choose a VM')
    loading.stop()

    const list = blessed.list({
      parent: box,
      items: vms,
      mouse: true,
      keys: true,
      style: {
        fg: 'white',
        bg: 'blue',
        selected: {
          bg: 'white',
          colour: 'blue'
        }
      }
    })

    list.on('select', selected => {
      list.destroy()
      emitter.emit('vm:selected', selected.content)
    })

    list.focus()
    screen.render()
  })

  emitter.on('vm:link:load', vm => {
    box.setLabel('Installing VM')
    loading.load(`Getting VM link for '${vm}'`)
    screen.render()
  })

  emitter.on('vm:link:retry', (vm, retry) => {
    box.setLabel('Installing VM')
    loading.stop()
    loading.load(`Getting VM link for '${vm}' (retry ${retry} of 5)`)
    screen.render()
  })

  emitter.on('vm:link:loaded', (vm, link) => {
    box.setLabel('Installing VM')
    loading.load(`Got VM link for '${vm}'`)
    screen.render()
  })

  emitter.on('vm:download:start', (vm, link) => {
    box.setLabel('Downloading VM')
    loading.load(`Downloading '${vm}' from ${link}`)

    statusBox = blessed.box({
      parent: box,
      top: 0,
      left: 0,
      height: 4,
      style: {
        fg: 'white',
        bg: 'blue',
        border: {
          fg: '#f0f0f0'
        }
      }
    });

    progressBar = blessed.ProgressBar({
      parent: box,
      orientation: 'horizontal',
      width: '50%',
      height: 2,
      top: 5,
      left: 0,
      style: {
        bg: 'blue',
        bar: {
          bg: 'white'
        },
        border: {
          bg: 'white'
        }
      }
    })

    screen.render()
  })

  emitter.on('vm:download:progress', (vm, link, progress) => {
    box.setLabel('Downloading VM')
    loading.stop()

    statusBox.setLine(0, `Downloading '${vm}' from ${link}`)
    statusBox.setLine(1, `Downloaded ${prettySize(progress.size.transferred)} of ${prettySize(progress.size.total)} at ${prettySize(progress.speed)}/s`)
    statusBox.setLine(2, `Elapsed: ${moment.duration(progress.time.elapsed, 'seconds').humanize()}`)
    statusBox.setLine(3, `Remaining: ${moment.duration(progress.time.remaining, 'seconds').humanize()}`)

    progressBar.setProgress(progress.percent * 100)

    screen.render()
  })
}
