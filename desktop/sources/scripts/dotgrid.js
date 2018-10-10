'use strict'

function Dotgrid (width, height, grid_x, grid_y, block_x, block_y) {
  this.controller = null
  this.theme = new Theme()
  this.history = new History()

  this.grid_x = grid_x
  this.grid_y = grid_y
  this.block_x = block_x
  this.block_y = block_y

  // ISU

  this.install = function (host) {
    this.guide = new this.Guide()
    this.tool = new this.Tool()
    this.interface = new this.Interface()
    this.renderer = new this.Renderer()
    this.picker = new this.Picker()
    this.cursor = new this.Cursor()
    host.appendChild(this.guide.el)

    this.interface.install(host)
    this.theme.install(host, this.update)
  }

  this.start = function () {
    this.theme.start()
    this.tool.start()
    this.guide.start()
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
    DOTGRID.interface.update()
    DOTGRID.guide.update()
  }

  // File

  this.new = function () {
    this.set_zoom(1.0)
    this.set_size({ width: 300, height: 300 })
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
      this.guide.update()
    })
  }

  function grab (base64, name) {
    const link = document.createElement('a')
    link.setAttribute('href', base64)
    link.setAttribute('download', name)
    link.dispatchEvent(new MouseEvent(`click`, {bubbles: true, cancelable: true, view: window}));
  }

  this.save = function () {
    if (DOTGRID.tool.length() < 1) { console.warn('Nothing to save'); return }

    this.renderer.to_grid(grab)
  }

  this.export = function () {
    if (DOTGRID.tool.length() < 1) { console.warn('Nothing to export'); return }

    this.renderer.to_svg(grab)
  }

  this.render = function () {
    if (DOTGRID.tool.length() < 1) { console.warn('Nothing to render'); return }

    const size = { width: DOTGRID.tool.settings.size.width * 2, height: DOTGRID.tool.settings.size.height * 2 }
    this.renderer.to_png(size, grab)
  }

  // Basics

  this.set_size = function (size = { width: 300, height: 300 }, ui = true, scale = 1) {
    size = { width: clamp(step(size.width, 15), 105, 1080), height: clamp(step(size.height, 15), 120, 1080) }

    this.tool.settings.size.width = size.width
    this.tool.settings.size.height = size.height

    try {
      const win = require('electron').remote.getCurrentWindow()
      win.setSize((size.width + 100) * scale, (size.height + 100 + (ui ? 10 : 0)) * scale, true)
    } catch (err) {
      console.log('No window')
    }

    this.grid_x = size.width / 15
    this.grid_y = size.height / 15

    this.grid_width = this.tool.settings.size.width / this.grid_x
    this.grid_height = this.tool.settings.size.height / this.grid_y

    DOTGRID.guide.resize(size)

    this.interface.update()
    DOTGRID.guide.update()
  }

  this.set_zoom = function (scale) {
    this.set_size({ width: this.tool.settings.size.width, height: this.tool.settings.size.height }, true, scale)

    try {
      webFrame.setZoomFactor(scale)
    } catch (err) {
      console.log('Cannot zoom')
    }
  }

  // Draw

  this.reset = function () {
    this.tool.clear()
    this.update()
  }

  this.clear = function () {
    this.history.clear()
    this.tool.reset()
    this.reset()
    DOTGRID.guide.update()
    DOTGRID.interface.update(true)
  }

  this.resize = function () {
    const size = { width: step(window.innerWidth - 90, 15), height: step(window.innerHeight - 120, 15) }

    if (size.width == DOTGRID.tool.settings.size.width && size.height == DOTGRID.tool.settings.size.height) {
      return
    }

    console.log(`Resized: ${size.width}x${size.height}`)

    DOTGRID.tool.settings.size.width = size.width
    DOTGRID.tool.settings.size.height = size.height

    DOTGRID.grid_x = size.width / 15
    DOTGRID.grid_y = size.height / 15

    DOTGRID.grid_width = DOTGRID.tool.settings.size.width / DOTGRID.grid_x
    DOTGRID.grid_height = DOTGRID.tool.settings.size.height / DOTGRID.grid_y

    DOTGRID.guide.resize(size)

    document.title = `Dotgrid — ${size.width}x${size.height}`
  }

  this.drag = function (e) {
    e.preventDefault()
    e.stopPropagation()

    const file = e.dataTransfer.files[0]

    if (!file || !file.path || file.path.indexOf('.dot') < 0 && file.path.indexOf('.grid') < 0) { console.warn('Dotgrid', 'Not a dot file'); return }

    const reader = new FileReader()
    reader.onload = function (e) {
      DOTGRID.tool.replace(JSON.parse(e.target.result.toString().trim()))
      DOTGRID.guide.update()
    }
    reader.readAsText(file)
  }

  this.copy = function (e) {
    DOTGRID.guide.update()

    if (e.target !== this.picker.input) {
      e.clipboardData.setData('text/source', DOTGRID.tool.export(DOTGRID.tool.layer()))
      e.clipboardData.setData('text/plain', DOTGRID.tool.path())
      e.clipboardData.setData('text/html', DOTGRID.renderer.svg_el.outerHTML)
      e.clipboardData.setData('text/svg+xml', DOTGRID.renderer.svg_el.outerHTML)
      e.preventDefault()
    }

    DOTGRID.guide.update()
  }

  this.cut = function (e) {
    DOTGRID.guide.update()

    if (e.target !== this.picker.input) {
      e.clipboardData.setData('text/plain', DOTGRID.tool.export(DOTGRID.tool.layer()))
      e.clipboardData.setData('text/html', DOTGRID.renderer.svg_el.outerHTML)
      e.clipboardData.setData('text/svg+xml', DOTGRID.renderer.svg_el.outerHTML)
      DOTGRID.tool.layers[DOTGRID.tool.index] = []
      e.preventDefault()
    }

    DOTGRID.guide.update()
  }

  this.paste = function (e) {
    if (e.target !== this.picker.el) {
      let data = e.clipboardData.getData('text/source')
      if (is_json(data)) {
        data = JSON.parse(data.trim())
        DOTGRID.tool.import(data)
      }
      e.preventDefault()
    }

    DOTGRID.guide.update()
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

function is_json (text) { try { JSON.parse(text); return true } catch (error) { return false } }
function pos_is_equal (a, b) { return a && b && a.x == b.x && a.y == b.y }
function clamp (v, min, max) { return v < min ? min : v > max ? max : v }
function step (v, s) { return Math.round(v / s) * s }

const DOTGRID = new Dotgrid(300, 300, 20, 20, 4, 4)
