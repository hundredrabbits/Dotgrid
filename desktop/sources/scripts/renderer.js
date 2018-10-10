'use strict'

DOTGRID.Renderer = function () {
  // Create SVG parts
  this.svg_el = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  this.svg_el.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  this.svg_el.setAttribute('baseProfile', 'full')
  this.svg_el.setAttribute('version', '1.1')
  this.svg_el.style.fill = 'none'

  this.layer_1 = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  this.layer_2 = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  this.layer_3 = document.createElementNS('http://www.w3.org/2000/svg', 'path')

  this.svg_el.appendChild(this.layer_3)
  this.svg_el.appendChild(this.layer_2)
  this.svg_el.appendChild(this.layer_1)

  this.update = function () {
    this.svg_el.setAttribute('width', (DOTGRID.tool.settings.size.width - (5)) + 'px')
    this.svg_el.setAttribute('height', (DOTGRID.tool.settings.size.height + (10)) + 'px')
    this.svg_el.style.width = (DOTGRID.tool.settings.size.width - (5))
    this.svg_el.style.height = DOTGRID.tool.settings.size.height + (10)
    this.svg_el.style.strokeWidth = DOTGRID.tool.style().thickness

    let styles = DOTGRID.tool.styles
    let paths = DOTGRID.tool.paths()

    this.layer_1.style.strokeWidth = styles[0].thickness
    this.layer_1.style.strokeLinecap = styles[0].strokeLinecap
    this.layer_1.style.strokeLinejoin = styles[0].strokeLinejoin
    this.layer_1.style.stroke = styles[0].color
    this.layer_1.style.fill = styles[0].fill
    this.layer_1.setAttribute('d', paths[0])

    this.layer_2.style.strokeWidth = styles[1].thickness
    this.layer_2.style.strokeLinecap = styles[1].strokeLinecap
    this.layer_2.style.strokeLinejoin = styles[1].strokeLinejoin
    this.layer_2.style.stroke = styles[1].color
    this.layer_2.style.fill = styles[1].fill
    this.layer_2.setAttribute('d', paths[1])

    this.layer_3.style.strokeWidth = styles[2].thickness
    this.layer_3.style.strokeLinecap = styles[2].strokeLinecap
    this.layer_3.style.strokeLinejoin = styles[2].strokeLinejoin
    this.layer_3.style.stroke = styles[2].color
    this.layer_3.style.fill = styles[2].fill
    this.layer_3.setAttribute('d', paths[2])
  }

  this.svg64 = function () {
    this.update()

    let xml = new XMLSerializer().serializeToString(this.svg_el)
    let svg64 = btoa(xml)
    let b64Start = 'data:image/svg+xml;base64,'
    return b64Start + svg64
  }

  this.to_png = function (size = DOTGRID.tool.settings.size, callback) {
    let image64 = this.svg64()
    let img = new Image()

    let canvas = document.createElement('canvas')

    canvas.width = (size.width) * 2
    canvas.height = (size.height + 30) * 2

    let ctx = canvas.getContext('2d')

    img.onload = function () {
      ctx.drawImage(img, 0, 0, (size.width) * 2, (size.height + 30) * 2)
      let data = canvas.toDataURL('image/png')
      callback(data, 'export.png')
    }
    img.src = image64
  }

  this.to_svg = function (callback) {
    const image64 = this.svg64()
    callback(image64, 'export.svg')
  }

  this.to_grid = function (callback) {
    const text = DOTGRID.tool.export()
    const file = new Blob([text], { type: 'text/plain' })
    callback(URL.createObjectURL(file), 'export.grid')
  }
}
