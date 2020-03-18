'use strict'

/* global XMLSerializer */
/* global btoa */
/* global Image */
/* global Blob */

function Manager (client) {
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
    this.el.setAttribute('width', (client.tool.settings.size.width) + 'px')
    this.el.setAttribute('height', (client.tool.settings.size.height) + 'px')
    this.el.style.width = client.tool.settings.size.width
    this.el.style.height = client.tool.settings.size.height

    const styles = client.tool.styles
    const paths = client.tool.paths()

    for (const id in this.layers) {
      const style = styles[id]
      const path = paths[id]
      const layer = this.layers[id]

      layer.style.strokeWidth = style.thickness
      layer.style.strokeLinecap = style.strokeLinecap
      layer.style.strokeLinejoin = style.strokeLinejoin
      layer.style.stroke = style.color
      layer.style.fill = style.fill

      layer.setAttribute('d', path)
    }
  }

  this.minimalViewBox = function () {
    const styles = client.tool.styles
    const paths = client.tool.paths()

    var xMin = null
    var yMin = null
    var xMax = null
    var yMax = null
    for (const id in this.layers) {
      const style = styles[id]
      const canOvershoot = style.strokeLinejoin === 'miter' || style.strokeLinecap === 'square'
      const offset = canOvershoot ? style.thickness : style.thickness / 2

      const path = paths[id]
      const matches = path.match(/\d+,\d+/g)
      console.log(matches)
      if (matches === null) { continue }

      const coordinates = matches.map(p => p.split(/,/))
      const xs = coordinates.map(p => p[0]);
      const ys = coordinates.map(p => p[1]);
      const xMinOfLayer = Math.min(...xs) - offset
      const yMinOfLayer = Math.min(...ys) - offset
      const xMaxOfLayer = Math.max(...xs) + offset
      const yMaxOfLayer = Math.max(...ys) + offset

      console.log(xMinOfLayer)
      console.log(yMinOfLayer)
      console.log(xMaxOfLayer)
      console.log(yMaxOfLayer)

      if (xMin === null || xMinOfLayer < xMin) { xMin = xMinOfLayer }
      if (yMin === null || yMinOfLayer < yMin) { yMin = yMinOfLayer }
      if (xMax === null || xMaxOfLayer > xMax) { xMax = xMaxOfLayer }
      if (yMax === null || yMaxOfLayer > yMax) { yMax = yMaxOfLayer }
    }
    if (xMin === null || yMin === null || xMax === null || yMax === null) { return '' }

    const viewBox = xMin + ' ' + yMin + ' ' + (xMax - xMin) + ' ' + (yMax - yMin)
    console.log(viewBox)
    return viewBox
  }

  this.svg64 = function () {
    const xml = new XMLSerializer().serializeToString(this.el)
    const svg64 = btoa(xml)
    const b64Start = 'data:image/svg+xml;base64,'
    return b64Start + svg64
  }

  // Exporters

  this.toPNG = function (size = client.tool.settings.size, callback) {
    this.update()

    const image64 = this.svg64()
    const img = new Image()
    const canvas = document.createElement('canvas')
    canvas.width = (size.width) * 2
    canvas.height = (size.height) * 2
    img.onload = function () {
      canvas.getContext('2d').drawImage(img, 0, 0, (size.width) * 2, (size.height) * 2)
      callback(canvas.toDataURL('image/png'))
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

    const text = client.tool.export()
    const file = new Blob([text], { type: 'text/plain' })
    callback(URL.createObjectURL(file), 'export.grid')
  }

  this.toString = () => {
    const viewBox = this.minimalViewBox();
    if (viewBox !== '') {
      this.el.setAttribute('width', viewBox.split(/ /)[2] + 'px')
      this.el.removeAttribute('height')
      this.el.style.width = null
      this.el.style.height = null
      this.el.setAttribute('viewBox', this.minimalViewBox())
    }
    const serialized = new XMLSerializer().serializeToString(this.el)
    if (viewBox !== '') {
      this.el.setAttribute('width', (client.tool.settings.size.width) + 'px')
      this.el.setAttribute('height', (client.tool.settings.size.height) + 'px')
      this.el.style.width = client.tool.settings.size.width
      this.el.style.height = client.tool.settings.size.height
      this.el.removeAttribute('viewBox')
    }

    return serialized
  }
}
