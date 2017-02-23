
const blessed = require('blessed')
const pkg = require('../package.json')
const prettySize = require('pretty-size')
const moment = require('moment')

const screen = blessed.screen({
  smartCSR: true,
  title: pkg.name
})

const box = blessed.box({
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

const loading = blessed.loading({
  parent: box,
  style: {
    fg: 'white',
    bg: 'blue'
  }
})

statusBox = blessed.box({
  parent: box,
  top: 0,
  left: 0,
  height: 6,
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
  //width: 'shrink',
  height: 2,
  top: 6,
  padding: {
    left: 1,
    right: 1
  },
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

screen.append(box);
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
})

box.focus()
screen.render();

module.exports = emitter => {

  emitter.on('error', () => {
    loading.stop()
    screen.destroy()
  })

  emitter.on('vm:list:loading', () => {
    box.setLabel('Choose a VM')
    loading.load('Loading available VMs')

    screen.render();
  })

  emitter.on('vm:list:loaded', event => {
    box.setLabel('Choose a VM')
    loading.stop()

    const list = blessed.list({
      parent: box,
      items: event.vms,
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
      emitter.emit('vm:selected', {
        vm: selected.content
      })
    })

    list.focus()
    screen.render()
  })

  emitter.on('vm:link:load', event => {
    box.setLabel('Installing VM')
    loading.load(`Getting VM link for '${event.vm}'`)
    screen.render()
  })

  emitter.on('vm:link:retry', event => {
    box.setLabel('Installing VM')
    loading.stop()
    loading.load(`Getting VM link for '${event.vm}' (retry ${event.attempt} of ${event.max})`)
    screen.render()
  })

  emitter.on('vm:link:loaded', event => {
    box.setLabel('Installing VM')
    loading.load(`Got VM link for '${event.vm}'`)
    screen.render()
  })

  emitter.on('vm:download:start', event => {
    box.setLabel('Downloading VM')
    loading.load(`Downloading '${event.vm}' from ${event.source}`)

    screen.render()
  })

  emitter.on('vm:download:progress', event => {
    box.setLabel(`Downloading ${event.vm}`)
    loading.stop()

    statusBox.setLine(0, `Source ${event.source}`)
    statusBox.setLine(1, `Target ${event.target}`)
    statusBox.setLine(2, `Downloaded ${prettySize(event.progress.size.transferred)} of ${prettySize(event.progress.size.total)} at ${prettySize(event.progress.speed)}/s`)
    statusBox.setLine(3, `Elapsed: ${moment.duration(event.progress.time.elapsed, 'seconds').humanize()}`)
    statusBox.setLine(4, `Remaining: ${moment.duration(event.progress.time.remaining, 'seconds').humanize()}`)

    progressBar.setProgress(event.progress.percent * 100)

    screen.render()
  })

  emitter.on('vm:unpack:unpacking', event => {
    box.setLabel(`Unpacking ${event.vm}`)

    statusBox.destroy()
    progressBar.destroy()

    loading.load(`Unpacking '${event.file} to ${event.target}'`)

    screen.render()
  })

  emitter.on('vm:unpack:success', event => {
    screen.destroy()
  })
}
