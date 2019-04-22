'use strict'

function Source (dotgrid) {
  this.new = function () {
    dotgrid.setZoom(1.0)
    dotgrid.history.push(dotgrid.tool.layers)
    dotgrid.clear()
  }

  this.open = function () {
    if (!dialog) { return }

    const paths = dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: 'Dotgrid Image', extensions: ['dot', 'grid'] }] })

    if (!paths) { console.warn('Nothing to load'); return }

    fs.readFile(paths[0], 'utf-8', (err, data) => {
      if (err) { alert('An error ocurred reading the file :' + err.message); return }
      this.load(paths[0], data)
    })
  }

  this.load = function (path, data) {
    if (!path || isJson(data) === false) { return }
    const parsed = JSON.parse(`${data}`)
    console.log(path)
    dotgrid.tool.replace(parsed)
  }

  this.save = function () {
    if (dotgrid.tool.length() < 1) { console.warn('Nothing to save'); return }
    dotgrid.manager.toGRID(grab)
  }

  this.export = function () {
    if (dotgrid.tool.length() < 1) { console.warn('Nothing to export'); return }
    dotgrid.manager.toSVG(grab)
  }

  this.render = function () {
    if (dotgrid.tool.length() < 1) { console.warn('Nothing to render'); return }
    dotgrid.manager.toPNG({ width: dotgrid.tool.settings.size.width * 2, height: dotgrid.tool.settings.size.height * 2 }, grab)
  }

  function grab (base64, name) {
    const link = document.createElement('a')
    link.setAttribute('href', base64)
    link.setAttribute('download', name)
    link.dispatchEvent(new MouseEvent(`click`, { bubbles: true, cancelable: true, view: window }))
  }

  function isJson (text) { try { JSON.parse(text); return true } catch (error) { return false } }
}
