'use strict'

function Dotgrid () {
  const defaultTheme = {
    background: '#eee',
    f_high: '#000',
    f_med: '#999',
    f_low: '#ccc',
    f_inv: '#000',
    b_high: '#000',
    b_med: '#888',
    b_low: '#aaa',
    b_inv: '#ffb545'
  }

  // ISU

  this.install = function (host) {
    this.theme = new Theme(defaultTheme)
    this.history = new History()
    this.manager = new Manager(this)
    this.renderer = new Renderer(this)
    this.tool = new Tool(this)
    this.interface = new Interface(this)
    this.picker = new Picker(this)
    this.cursor = new Cursor(this)
    this.listener = new Listener(this)

    host.appendChild(this.renderer.el)

    this.manager.install()
    this.interface.install(host)
    this.theme.install(host, this.update)
  }

  this.start = function () {
    this.theme.start()
    this.tool.start()
    this.renderer.start()
    this.interface.start()

    document.addEventListener('mousedown', function (e) { DOTGRID.cursor.down(e) }, false)
    document.addEventListener('mousemove', function (e) { DOTGRID.cursor.move(e) }, false)
    document.addEventListener('contextmenu', function (e) { DOTGRID.cursor.alt(e) }, false)
    document.addEventListener('mouseup', function (e) { DOTGRID.cursor.up(e) }, false)
    document.addEventListener('copy', function (e) { DOTGRID.copy(e) }, false)
    document.addEventListener('cut', function (e) { DOTGRID.cut(e) }, false)
    document.addEventListener('paste', function (e) { DOTGRID.paste(e) }, false)
    window.addEventListener('drop', DOTGRID.drag)

    this.new()

    setTimeout(() => { document.body.className += ' ready' }, 250)
  }

  this.update = function () {
    DOTGRID.resize()
    DOTGRID.manager.update()
    DOTGRID.interface.update()
    DOTGRID.renderer.update()
  }

  this.clear = function () {
    this.history.clear()
    this.tool.reset()
    this.reset()
    this.renderer.update()
    this.interface.update(true)
  }

  this.reset = function () {
    this.tool.clear()
    this.update()
  }

  // File

  this.new = function () {
    this.setZoom(1.0)
    this.history.push(this.tool.layers)
    this.clear()
  }

  this.open = function () {
    if (!dialog) { return }

    const paths = dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: 'Dotgrid Image', extensions: ['dot', 'grid'] }] })

    if (!paths) { console.warn('Nothing to load'); return }

    fs.readFile(paths[0], 'utf-8', (err, data) => {
      if (err) { alert('An error ocurred reading the file :' + err.message); return }
      this.tool.replace(JSON.parse(data.toString().trim()))
      this.renderer.update()
    })
  }

  this.save = function () {
    if (DOTGRID.tool.length() < 1) { console.warn('Nothing to save'); return }
    this.manager.toGRID(grab)
  }

  this.export = function () {
    if (DOTGRID.tool.length() < 1) { console.warn('Nothing to export'); return }
    this.manager.toSVG(grab)
  }

  this.render = function () {
    if (DOTGRID.tool.length() < 1) { console.warn('Nothing to render'); return }
    this.manager.toPNG({ width: DOTGRID.tool.settings.size.width * 2, height: DOTGRID.tool.settings.size.height * 2 }, grab)
  }

  function grab (base64, name) {
    const link = document.createElement('a')
    link.setAttribute('href', base64)
    link.setAttribute('download', name)
    link.dispatchEvent(new MouseEvent(`click`, { bubbles: true, cancelable: true, view: window }))
  }

  // Basics

  this.getSize = function () {
    return { markers: {
      w: parseInt(this.tool.settings.size.width / 15),
      h: parseInt(this.tool.settings.size.height / 15) }
    }
  }

  this.setSize = function (size = { width: 600, height: 300 }, ui = true, scale = 1) {
    size = { width: clamp(step(size.width, 15), 105, 1080), height: clamp(step(size.height, 15), 120, 1080) }

    this.tool.settings.size.width = size.width
    this.tool.settings.size.height = size.height

    try {
      const win = require('electron').remote.getCurrentWindow()
      win.setSize((size.width + 100) * scale, (size.height + 100) * scale, false)
    } catch (err) {
      console.log('No window')
    }

    this.renderer.resize(size)
    this.interface.update()
    this.renderer.update()
  }

  this.resize = function () {
    const size = { width: step(window.innerWidth - 90, 15), height: step(window.innerHeight - 120, 15) }

    if (size.width === this.tool.settings.size.width && size.height === this.tool.settings.size.height) {
      return
    }

    console.log(`Resized to: ${size.width}x${size.height}`)

    this.tool.settings.size.width = size.width
    this.tool.settings.size.height = size.height

    this.renderer.resize(size)

    document.title = `Dotgrid — ${size.width}x${size.height}`
  }

  this.setZoom = function (scale) {
    try {
      webFrame.setZoomFactor(scale)
    } catch (err) {
      console.log('Cannot zoom')
    }
  }

  // Events

  this.drag = function (e) {
    e.preventDefault()
    e.stopPropagation()

    const file = e.dataTransfer.files[0]
    const filename = file.path ? file.path : file.name ? file.name : ''

    if (filename.indexOf('.grid') < 0) { console.warn('Dotgrid', 'Not a .grid file'); return }

    const reader = new FileReader()

    reader.onload = function (e) {
      const data = e.target && e.target.result ? e.target.result : ''
      if (data && !isJson(data)) { return }
      DOTGRID.tool.replace(JSON.parse(`${data}`))
      DOTGRID.renderer.update()
    }
    reader.readAsText(file)
  }

  this.copy = function (e) {
    DOTGRID.renderer.update()

    if (e.target !== this.picker.input) {
      e.clipboardData.setData('text/source', DOTGRID.tool.export(DOTGRID.tool.layer()))
      e.clipboardData.setData('text/plain', DOTGRID.tool.path())
      e.clipboardData.setData('text/html', DOTGRID.manager.el.outerHTML)
      e.clipboardData.setData('text/svg+xml', DOTGRID.manager.el.outerHTML)
      e.preventDefault()
    }

    DOTGRID.renderer.update()
  }

  this.cut = function (e) {
    DOTGRID.renderer.update()

    if (e.target !== this.picker.input) {
      e.clipboardData.setData('text/source', DOTGRID.tool.export(DOTGRID.tool.layer()))
      e.clipboardData.setData('text/plain', DOTGRID.tool.export(DOTGRID.tool.layer()))
      e.clipboardData.setData('text/html', DOTGRID.manager.el.outerHTML)
      e.clipboardData.setData('text/svg+xml', DOTGRID.manager.el.outerHTML)
      DOTGRID.tool.layers[DOTGRID.tool.index] = []
      e.preventDefault()
    }

    DOTGRID.renderer.update()
  }

  this.paste = function (e) {
    if (e.target !== this.picker.el) {
      let data = e.clipboardData.getData('text/source')
      if (isJson(data)) {
        data = JSON.parse(data.trim())
        DOTGRID.tool.import(data)
      }
      e.preventDefault()
    }

    DOTGRID.renderer.update()
  }
}

window.addEventListener('resize', function (e) {
  DOTGRID.update()
}, false)

window.addEventListener('dragover', function (e) {
  e.stopPropagation()
  e.preventDefault()
  e.dataTransfer.dropEffect = 'copy'
})

String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase()
}

function isJson (text) { try { JSON.parse(text); return true } catch (error) { return false } }
function isEqual (a, b) { return a && b && a.x == b.x && a.y == b.y }
function clamp (v, min, max) { return v < min ? min : v > max ? max : v }
function step (v, s) { return Math.round(v / s) * s }

const DOTGRID = new Dotgrid()
