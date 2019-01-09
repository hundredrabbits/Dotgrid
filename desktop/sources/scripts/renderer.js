'use strict'

DOTGRID.Renderer = function () {
  // Create SVG parts
  this.el = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  this.el.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  this.el.setAttribute('baseProfile', 'full')
  this.el.setAttribute('version', '1.1')
  this.el.style.fill = 'none'

  this.layers = []

  this.install = function () {
    this.layers[0] = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    this.layers[1] = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    this.layers[2] = document.createElementNS('http://www.w3.org/2000/svg', 'path')

    this.el.appendChild(this.layers[2])
    this.el.appendChild(this.layers[1])
    this.el.appendChild(this.layers[0])
  }

  this.update = function () {
    this.el.setAttribute('width', (DOTGRID.tool.settings.size.width) + 'px')
    this.el.setAttribute('height', (DOTGRID.tool.settings.size.height) + 'px')
    this.el.style.width = (DOTGRID.tool.settings.size.width)
    this.el.style.height = DOTGRID.tool.settings.size.height

    const styles = DOTGRID.tool.styles
    const paths = DOTGRID.tool.paths()

    for (const id in this.layers) {
      const style = styles[id]
      const path = paths[id]
      const layer = this.layers[id]
      layer.style.strokeWidth = style.thickness
      layer.style.strokeLinecap = style.strokeLinecap
      layer.style.strokeLinejoin = style.strokeLinejoin
      layer.style.stroke = style.color
      layer.style.fill = style.fill
      layer.setAttribute('d', paths[id])
    }
  }

  this.svg64 = function () {
    this.update()
    let xml = new XMLSerializer().serializeToString(this.el)
    let svg64 = btoa(xml)
    let b64Start = 'data:image/svg+xml;base64,'
    return b64Start + svg64
  }

  this.toPNG = function (size = DOTGRID.tool.settings.size, callback) {
    let image64 = this.svg64()
    let img = new Image()
    let canvas = document.createElement('canvas')
    canvas.width = (size.width) * 2
    canvas.height = (size.height) * 2
    let ctx = canvas.getContext('2d')
    img.onload = function () {
      ctx.drawImage(img, 0, 0, (size.width) * 2, (size.height) * 2)
      let data = canvas.toDataURL('image/png')
      callback(data, 'export.png')
    }
    img.src = image64
  }

  this.toSVG = function (callback) {
    const image64 = this.svg64()
    callback(image64, 'export.svg')
  }

  this.toGRID = function (callback) {
    const text = DOTGRID.tool.export()
    const file = new Blob([text], { type: 'text/plain' })
    callback(URL.createObjectURL(file), 'export.grid')
  }
}
