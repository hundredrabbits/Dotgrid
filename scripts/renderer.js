'use strict'

/* global Image */
/* global Path2D */
/* global Generator */

function Renderer (client) {
  this.el = document.createElement('canvas')
  this.el.id = 'guide'
  this.el.width = 640
  this.el.height = 640
  this.el.style.width = '320px'
  this.el.style.height = '320px'
  this.context = this.el.getContext('2d')
  this.showExtras = true

  this.scale = 2 // window.devicePixelRatio

  this.start = function () {
    this.update()
  }

  this.update = function (force = false) {
    this.resize()
    client.manager.update()
    const render = new Image()
    render.onload = () => {
      this.draw(render)
    }
    render.src = client.manager.svg64()
  }

  this.draw = function (render) {
    this.clear()
    this.drawMirror()
    this.drawGrid()
    this.drawRulers()
    this.drawRender(render) //
    this.drawVertices()
    this.drawMaskPaths()
    this.drawHandles()
    this.drawTranslation()
    this.drawCursor()
    this.drawPreview()
  }

  this.clear = function () {
    this.context.clearRect(0, 0, this.el.width * this.scale, this.el.height * this.scale)
  }

  this.toggle = function () {
    this.showExtras = !this.showExtras
    this.update()
    client.interface.update(true)
  }

  this.resize = function () {
    const _target = client.getPaddedSize()
    const _current = { width: this.el.width / this.scale, height: this.el.height / this.scale }
    const offset = sizeOffset(_target, _current)
    if (offset.width === 0 && offset.height === 0) {
      return
    }
    console.log('Renderer', `Require resize: ${printSize(_target)}, from ${printSize(_current)}`)
    this.el.width = (_target.width) * this.scale
    this.el.height = (_target.height) * this.scale
    this.el.style.width = (_target.width) + 'px'
    this.el.style.height = (_target.height) + 'px'
  }

  // Collections

  this.drawMirror = function () {
    if (!this.showExtras) { return }

    if (client.tool.style().mirror_style === 0) { return }

    const middle = { x: client.tool.settings.size.width, y: client.tool.settings.size.height }

    if (client.tool.style().mirror_style === 1 || client.tool.style().mirror_style === 3) {
      this.drawRule({ x: middle.x, y: 15 * this.scale }, { x: middle.x, y: (client.tool.settings.size.height) * this.scale })
    }
    if (client.tool.style().mirror_style === 2 || client.tool.style().mirror_style === 3) {
      this.drawRule({ x: 15 * this.scale, y: middle.y }, { x: (client.tool.settings.size.width) * this.scale, y: middle.y })
    }
  }

  this.drawHandles = function () {
    if (!this.showExtras) { return }

    for (const segmentId in client.tool.layer()) {
      const segment = client.tool.layer()[segmentId]
      for (const vertexId in segment.vertices) {
        const vertex = segment.vertices[vertexId]
        this.drawHandle(vertex)
      }
    }
  }

  this.drawVertices = function () {
    for (const id in client.tool.vertices) {
      this.drawVertex(client.tool.vertices[id])
    }
  }

  this.drawMaskPaths = function () {
    if (client.tool.style().mask) {
      for (const part of client.tool.layer()) {
        for (const vertex of part['vertices']) {
          this.drawVertex(vertex)
          this.drawCursor(vertex, client.tool.style().thickness)
        }
      }
      const path = new Generator(client.tool.layer(), client.tool.style()).toString({ x: 0, y: 0 }, 2)
      const style = {
        color: client.theme.active.f_med,
        thickness: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeLineDash: [5, 15]
      }
      this.drawPath(path, style)
    }
  }

  this.drawGrid = function () {
    if (!this.showExtras) { return }

    const markers = { w: parseInt(client.tool.settings.size.width / 15), h: parseInt(client.tool.settings.size.height / 15) }

    this.context.beginPath()
    this.context.lineWidth = 2
    this.context.fillStyle = client.theme.active.b_med
    for (let x = markers.w - 1; x >= 0; x--) {
      for (let y = markers.h - 1; y >= 0; y--) {
        const isStep = x % 4 === 0 && y % 4 === 0
        // Don't draw margins
        if (x === 0 || y === 0) { continue }
        const pos = {
          x: parseInt(x * 15),
          y: parseInt(y * 15)
        }
        const radius = isStep ? 2.5 : 1.5
        this.context.moveTo(pos.x * this.scale, pos.y * this.scale)
        this.context.arc(pos.x * this.scale, pos.y * this.scale, radius, 0, 2 * Math.PI, false)
      }
    }
    this.context.fill()
    this.context.closePath()
  }

  this.drawRulers = function () {
    if (!client.cursor.translation) { return }

    const pos = client.cursor.translation.to
    const bottom = (client.tool.settings.size.height * this.scale)
    const right = (client.tool.settings.size.width * this.scale)

    this.drawRule({ x: pos.x * this.scale, y: 0 }, { x: pos.x * this.scale, y: bottom })
    this.drawRule({ x: 0, y: pos.y * this.scale }, { x: right, y: pos.y * this.scale })
  }

  this.drawPreview = function () {
    const operation = client.cursor.operation && client.cursor.operation.cast ? client.cursor.operation.cast : null

    if (!client.tool.canCast(operation)) { return }
    if (operation === 'close') { return }

    const path = new Generator([{ vertices: client.tool.vertices, type: operation }]).toString({ x: 0, y: 0 }, 2)
    const style = {
      color: client.theme.active.f_med,
      thickness: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      strokeLineDash: [5, 15]
    }
    this.drawPath(path, style)
  }

  // Elements

  this.drawVertex = function (pos, radius = 5) {
    this.context.beginPath()
    this.context.lineWidth = 2
    this.context.arc((pos.x * this.scale), (pos.y * this.scale), radius, 0, 2 * Math.PI, false)
    this.context.fillStyle = client.theme.active.f_low
    this.context.fill()
    this.context.closePath()
  }

  this.drawRule = function (from, to) {
    this.context.beginPath()
    this.context.moveTo(from.x, from.y)
    this.context.lineTo(to.x, to.y)
    this.context.lineCap = 'round'
    this.context.lineWidth = 3
    this.context.strokeStyle = client.theme.active.b_low
    this.context.stroke()
    this.context.closePath()
  }

  this.drawHandle = function (pos, radius = 6) {
    this.context.beginPath()
    this.context.arc(Math.abs(pos.x * -this.scale), Math.abs(pos.y * this.scale), radius + 3, 0, 2 * Math.PI, false)
    this.context.fillStyle = client.theme.active.f_high
    this.context.fill()
    this.context.closePath()
    this.context.beginPath()
    this.context.arc((pos.x * this.scale), (pos.y * this.scale), radius - 3, 0, 2 * Math.PI, false)
    this.context.fillStyle = client.theme.active.b_low
    this.context.fill()
    this.context.closePath()
  }

  this.drawPath = function (path, style) {
    const p = new Path2D(path)

    this.context.strokeStyle = style.color
    this.context.lineWidth = style.thickness * this.scale
    this.context.lineCap = style.strokeLinecap
    this.context.lineJoin = style.strokeLinejoin

    if (style.fill && style.fill !== 'none') {
      this.context.fillStyle = style.color
      this.context.fill(p)
    }

    // Dash
    this.context.save()
    if (style.strokeLineDash) { this.context.setLineDash(style.strokeLineDash) } else { this.context.setLineDash([]) }
    this.context.stroke(p)
    this.context.restore()
  }

  this.drawTranslation = function () {
    if (!client.cursor.translation) { return }

    this.context.save()

    this.context.beginPath()
    this.context.moveTo((client.cursor.translation.from.x * this.scale), (client.cursor.translation.from.y * this.scale))
    this.context.lineTo((client.cursor.translation.to.x * this.scale), (client.cursor.translation.to.y * this.scale))
    this.context.lineCap = 'round'
    this.context.lineWidth = 5
    this.context.strokeStyle = client.cursor.translation.multi === true ? client.theme.active.b_inv : client.cursor.translation.copy === true ? client.theme.active.f_med : client.theme.active.f_low
    this.context.setLineDash([5, 10])
    this.context.stroke()
    this.context.closePath()

    this.context.setLineDash([])
    this.context.restore()
  }

  this.drawCursor = function (pos = client.cursor.pos, radius = client.tool.style().thickness - 1) {
    this.context.save()

    this.context.beginPath()
    this.context.lineWidth = 3
    this.context.lineCap = 'round'
    this.context.arc(Math.abs(pos.x * -this.scale), Math.abs(pos.y * this.scale), 5, 0, 2 * Math.PI, false)
    this.context.strokeStyle = client.theme.active.background
    this.context.stroke()
    this.context.closePath()

    this.context.beginPath()
    this.context.lineWidth = 3
    this.context.lineCap = 'round'
    this.context.arc(Math.abs(pos.x * -this.scale), Math.abs(pos.y * this.scale), clamp(radius, 5, 100), 0, 2 * Math.PI, false)
    this.context.strokeStyle = client.theme.active.f_med
    this.context.stroke()
    this.context.closePath()

    this.context.restore()
  }

  this.drawRender = function (render) {
    this.context.drawImage(render, 0, 0, this.el.width, this.el.height)
  }

  function printSize (size) { return `${size.width}x${size.height}` }
  function sizeOffset (a, b) { return { width: a.width - b.width, height: a.height - b.height } }
  function clamp (v, min, max) { return v < min ? min : v > max ? max : v }
}
