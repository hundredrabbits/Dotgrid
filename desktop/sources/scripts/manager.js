'use strict'

// Manages the SVG file

function Manager (dotgrid) {
  // Create SVG parts
  this.el = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  this.el.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  this.el.setAttribute('baseProfile', 'full')
  this.el.setAttribute('version', '1.1')
  this.el.style.fill = 'none'

  this.layers = []

  this.install = function () {
    this.el.appendChild(this.layers[2] = document.createElementNS('http://www.w3.org/2000/svg', 'path'))
    this.el.appendChild(this.layers[1] = document.createElementNS('http://www.w3.org/2000/svg', 'path'))
    this.el.appendChild(this.layers[0] = document.createElementNS('http://www.w3.org/2000/svg', 'path'))
  }

  this.update = function () {
    this.el.setAttribute('width', (DOTGRID.tool.settings.size.width + 15) + 'px')
    this.el.setAttribute('height', (DOTGRID.tool.settings.size.height + 15) + 'px')
    this.el.style.width = (DOTGRID.tool.settings.size.width + 15)
    this.el.style.height = DOTGRID.tool.settings.size.height + 15

    const styles = DOTGRID.tool.styles
    const paths = DOTGRID.tool.paths()

    for (const id in this.layers) {
      let style = styles[id]
      let path = paths[id]
      let layer = this.layers[id]
      // Easter Egg
      if (DOTGRID.tool.settings.crest === true) {
        style = styles[0]
        path = paths[0]
        layer.setAttribute('transform', `rotate(${parseInt(id) * 120} ${(DOTGRID.tool.settings.size.width / 2) + 7.5} ${(DOTGRID.tool.settings.size.height / 2) + 7.5})`)
      }

      layer.style.strokeWidth = style.thickness
      layer.style.strokeLinecap = style.strokeLinecap
      layer.style.strokeLinejoin = style.strokeLinejoin
      layer.style.stroke = style.color
      layer.style.fill = style.fill
      layer.setAttribute('d', path)
    }
  }

  this.svg64 = function () {
    let xml = new XMLSerializer().serializeToString(this.el)
    let svg64 = btoa(xml)
    let b64Start = 'data:image/svg+xml;base64,'
    return b64Start + svg64
  }

  // Exporters

  this.toPNG = function (size = DOTGRID.tool.settings.size, callback) {
    this.update()

    let image64 = this.svg64()
    let img = new Image()
    let canvas = document.createElement('canvas')
    canvas.width = (size.width) * 2
    canvas.height = (size.height) * 2
    img.onload = function () {
      canvas.getContext('2d').drawImage(img, 0, 0, (size.width) * 2, (size.height) * 2)
      callback(canvas.toDataURL('image/png'), 'export.png')
    }
    img.src = image64
  }

  this.toSVG = function (callback) {
    this.update()

    const image64 = this.svg64()
    callback(image64, 'export.svg')
  }

  this.toGRID = function (callback) {
    this.update()

    const text = DOTGRID.tool.export()
    const file = new Blob([text], { type: 'text/plain' })
    callback(URL.createObjectURL(file), 'export.grid')
  }
}
