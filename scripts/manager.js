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

  this.masks = []
  this.layers = []

  this.install = function () {
    this.masks[0] = [this.maskBg()]
    this.masks[1] = [this.maskBg(), document.createElementNS('http://www.w3.org/2000/svg', 'path')]
    this.masks[2] = [
      this.maskBg(),
      document.createElementNS('http://www.w3.org/2000/svg', 'path'),
      document.createElementNS('http://www.w3.org/2000/svg', 'path')
    ]

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
    this.el.appendChild(defs)
    for (const id of [2, 1, 0]) {
      const maskPath = document.createElementNS('http://www.w3.org/2000/svg', 'mask')
      maskPath.setAttribute('id', 'mask' + id)
      for (const mask of this.masks[id]) {
        maskPath.appendChild(mask)
      }
      defs.appendChild(maskPath)
    }

    this.el.appendChild(this.layers[2] = document.createElementNS('http://www.w3.org/2000/svg', 'path'))
    this.el.appendChild(this.layers[1] = document.createElementNS('http://www.w3.org/2000/svg', 'path'))
    this.el.appendChild(this.layers[0] = document.createElementNS('http://www.w3.org/2000/svg', 'path'))
  }

  this.maskBg = function () {
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    bg.setAttribute('fill', 'white')
    bg.setAttribute('width', '100%')
    bg.setAttribute('height', '100%')
    return bg
  }

  this.update = function () {
    this.el.setAttribute('width', (client.tool.settings.size.width) + 'px')
    this.el.setAttribute('height', (client.tool.settings.size.height) + 'px')
    this.el.style.width = client.tool.settings.size.width
    this.el.style.height = client.tool.settings.size.height

    const styles = client.tool.styles
    const paths = client.tool.paths()
    const masked = styles.map((style) => style.mask)

    const viewBox = this.minimalViewBox();
    if (viewBox !== null) {
      for (const id in this.masks) {
        const [x, y, width, height] = viewBox
        this.masks[id][0].setAttribute('x', x)
        this.masks[id][0].setAttribute('y', y)
        this.masks[id][0].setAttribute('width', width)
        this.masks[id][0].setAttribute('height', height)
      }
    }

    for (const id in this.layers) {
      const style = styles[id]
      const path = paths[id]
      const layer = this.layers[id]

      const nextLayer = parseInt(id) + 1
      for (var i = nextLayer; i < 3; i++) {
        const mask = this.masks[i][nextLayer]
        if (style.mask) {
          mask.setAttribute('d', path)
          mask.style.strokeWidth = style.thickness
          mask.style.strokeLinecap = style.strokeLinecap
          mask.style.strokeLinejoin = style.strokeLinejoin
          mask.style.stroke = style.color
          mask.style.fill = style.fill
        } else {
          mask.setAttribute('d', '')
        }
      }
      layer.style.strokeWidth = style.thickness
      layer.style.strokeLinecap = style.strokeLinecap
      layer.style.strokeLinejoin = style.strokeLinejoin
      layer.style.stroke = style.color
      layer.style.fill = style.fill

      layer.setAttribute('d', style.mask ? '' : path)

      const maskedAbove = masked.slice(0, id).some((mask) => mask === true)
      const maskPath = !(style.mask) && maskedAbove ? 'url(#mask' + id + ')' : null
      if (maskPath !== null) {
        layer.setAttribute('mask', maskPath)
      } else if (layer.hasAttribute('mask')) {
        layer.removeAttribute('mask')
      }
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
      if (matches === null) { continue }

      const coordinates = matches.map(p => p.split(/,/))
      const xs = coordinates.map(p => p[0]);
      const ys = coordinates.map(p => p[1]);
      const xMinOfLayer = Math.min(...xs) - offset
      const yMinOfLayer = Math.min(...ys) - offset
      const xMaxOfLayer = Math.max(...xs) + offset
      const yMaxOfLayer = Math.max(...ys) + offset

      if (xMin === null || xMinOfLayer < xMin) { xMin = xMinOfLayer }
      if (yMin === null || yMinOfLayer < yMin) { yMin = yMinOfLayer }
      if (xMax === null || xMaxOfLayer > xMax) { xMax = xMaxOfLayer }
      if (yMax === null || yMaxOfLayer > yMax) { yMax = yMaxOfLayer }
    }
    if (xMin === null || yMin === null || xMax === null || yMax === null) { return null }

    return [xMin, yMin, xMax - xMin, yMax - yMin]
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

  this.toString = () => {
    const viewBox = this.minimalViewBox();
    if (viewBox !== null) {
      this.el.setAttribute('width', viewBox[2] + 'px')
      this.el.removeAttribute('height')
      this.el.style.width = null
      this.el.style.height = null
      this.el.setAttribute('viewBox', viewBox.join(' '))
    }
    const serialized = new XMLSerializer().serializeToString(this.el)
    if (viewBox !== null) {
      this.el.setAttribute('width', (client.tool.settings.size.width) + 'px')
      this.el.setAttribute('height', (client.tool.settings.size.height) + 'px')
      this.el.style.width = client.tool.settings.size.width
      this.el.style.height = client.tool.settings.size.height
      this.el.removeAttribute('viewBox')
    }

    return serialized
  }
}
