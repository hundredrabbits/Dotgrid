'use strict'

function Renderer (dotgrid) {
  this.el = document.createElement('canvas')
  this.el.id = 'guide'
  this.el.width = 640
  this.el.height = 640
  this.el.style.width = '320px'
  this.el.style.height = '320px'
  this.context = this.el.getContext('2d')
  this.showExtras = true

  this.scale = 2

  this.start = function () {
    this.update()
  }

  this.update = function (force = false) {
    dotgrid.manager.update()

    this.clear()

    this.drawMirror()
    this.drawRulers()
    this.drawRender() //
    this.drawGrid()
    this.drawVertices()
    this.drawHandles()
    this.drawTranslation()
    this.drawCursor()
    this.drawPreview()
    this.drawDebug()
  }

  this.clear = function () {
    this.context.clearRect(0, 0, this.el.width * this.scale, this.el.height * this.scale)
  }

  this.toggle = function () {
    this.showExtras = !this.showExtras
    this.update()
    dotgrid.interface.update(true)
  }

  this.resize = function (size) {
    const pad = 15
    this.el.width = (size.width + pad) * this.scale
    this.el.height = (size.height + pad) * this.scale
    this.el.style.width = (size.width + pad) + 'px'
    this.el.style.height = (size.height + pad) + 'px'

    this.update()
  }

  // Collections

  this.drawMirror = function () {
    if (!this.showExtras) { return }

    if (dotgrid.tool.style().mirror_style === 0) { return }

    const middle = { x: dotgrid.tool.settings.size.width + (dotgrid.grid.width), y: dotgrid.tool.settings.size.height + (this.scale * dotgrid.grid.height) }

    if (dotgrid.tool.style().mirror_style === 1 || dotgrid.tool.style().mirror_style === 3) {
      this.drawRule({ x: middle.x, y: dotgrid.grid.height * this.scale }, { x: middle.x, y: (dotgrid.tool.settings.size.height + dotgrid.grid.height) * this.scale })
    }
    if (dotgrid.tool.style().mirror_style === 2 || dotgrid.tool.style().mirror_style === 3) {
      this.drawRule({ x: dotgrid.grid.width * this.scale, y: middle.y }, { x: (dotgrid.tool.settings.size.width + dotgrid.grid.width) * this.scale, y: middle.y })
    }
  }

  this.drawHandles = function () {
    if (!this.showExtras) { return }

    for (const segmentId in dotgrid.tool.layer()) {
      const segment = dotgrid.tool.layer()[segmentId]
      for (const vertexId in segment.vertices) {
        const vertex = segment.vertices[vertexId]
        this.drawHandle(vertex)
      }
    }
  }

  this.drawVertices = function () {
    for (const id in dotgrid.tool.vertices) {
      this.drawVertex(dotgrid.tool.vertices[id])
    }
  }

  this.drawGrid = function () {
    if (!this.showExtras) { return }

    const cursor = { x: parseInt(dotgrid.cursor.pos.x / dotgrid.grid.width), y: parseInt(dotgrid.cursor.pos.y / dotgrid.grid.width) }

    for (let x = dotgrid.grid.x - 1; x >= 0; x--) {
      for (let y = dotgrid.grid.y; y >= 0; y--) {
        let is_step = x % 4 == 0 && y % 4 == 0
        // Color
        let color = is_step ? dotgrid.theme.active.b_med : dotgrid.theme.active.b_low
        if ((y == 0 || y == dotgrid.grid.y) && cursor.x == x + 1) { color = dotgrid.theme.active.b_high } else if ((x == 0 || x == dotgrid.grid.x - 1) && cursor.y == y + 1) { color = dotgrid.theme.active.b_high } else if (cursor.x == x + 1 && cursor.y == y + 1) { color = dotgrid.theme.active.b_high }

        this.drawMarker({
          x: parseInt(x * dotgrid.grid.width) + dotgrid.grid.width,
          y: parseInt(y * dotgrid.grid.height) + dotgrid.grid.height
        }, is_step ? 2.5 : 1.5, color)
      }
    }
  }

  this.drawRulers = function () {
    if (!dotgrid.cursor.translation) { return }

    const pos = dotgrid.cursor.translation.to
    const bottom = (dotgrid.tool.settings.size.height * this.scale)
    const right = (dotgrid.tool.settings.size.width * this.scale)

    this.drawRule({ x: pos.x * this.scale, y: 0 }, { x: pos.x * this.scale, y: bottom })
    this.drawRule({ x: 0, y: pos.y * this.scale }, { x: right, y: pos.y * this.scale })
  }

  this.drawPreview = function () {
    let operation = dotgrid.cursor.operation && dotgrid.cursor.operation.cast ? dotgrid.cursor.operation.cast : null

    if (!dotgrid.tool.canCast(operation)) { return }
    if (operation == 'close') { return }

    let path = new Generator([{ vertices: dotgrid.tool.vertices, type: operation }]).toString({ x: 0, y: 0 }, 2)
    let style = {
      color: dotgrid.theme.active.f_med,
      thickness: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      strokeLineDash: [5, 15]
    }
    this.drawPath(path, style)
  }

  // Elements

  this.drawMarker = function (pos, radius = 1, color) {
    this.context.beginPath()
    this.context.lineWidth = 2
    this.context.arc(pos.x * this.scale, pos.y * this.scale, radius, 0, 2 * Math.PI, false)
    this.context.fillStyle = color
    this.context.fill()
    this.context.closePath()
  }

  this.drawVertex = function (pos, radius = 5) {
    this.context.beginPath()
    this.context.lineWidth = 2
    this.context.arc((pos.x * this.scale), (pos.y * this.scale), radius, 0, 2 * Math.PI, false)
    this.context.fillStyle = dotgrid.theme.active.f_med
    this.context.fill()
    this.context.closePath()
  }

  this.drawRule = function (from, to) {
    this.context.beginPath()
    this.context.moveTo(from.x, from.y)
    this.context.lineTo(to.x, to.y)
    this.context.lineCap = 'round'
    this.context.lineWidth = 3
    this.context.strokeStyle = dotgrid.theme.active.b_low
    this.context.stroke()
    this.context.closePath()
  }

  this.drawHandle = function (pos, radius = 6) {
    this.context.beginPath()
    this.context.lineWidth = 3
    this.context.lineCap = 'round'
    this.context.arc(Math.abs(pos.x * -this.scale), Math.abs(pos.y * this.scale), radius + 3, 0, 2 * Math.PI, false)
    this.context.fillStyle = dotgrid.theme.active.f_high
    this.context.fill()
    this.context.strokeStyle = dotgrid.theme.active.f_high
    this.context.stroke()
    this.context.closePath()

    this.context.beginPath()
    this.context.arc((pos.x * this.scale), (pos.y * this.scale), radius, 0, 2 * Math.PI, false)
    this.context.fillStyle = dotgrid.theme.active.f_low
    this.context.fill()
    this.context.closePath()

    this.context.beginPath()
    this.context.arc((pos.x * this.scale), (pos.y * this.scale), radius - 3, 0, 2 * Math.PI, false)
    this.context.fillStyle = dotgrid.theme.active.f_high
    this.context.fill()
    this.context.closePath()
  }

  this.drawPath = function (path, style) {
    let p = new Path2D(path)

    this.context.strokeStyle = style.color
    this.context.lineWidth = style.thickness * this.scale
    this.context.lineCap = style.strokeLinecap
    this.context.lineJoin = style.strokeLinejoin

    if (style.fill && style.fill != 'none') {
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
    if (!dotgrid.cursor.translation) { return }

    this.context.save()

    this.context.beginPath()
    this.context.moveTo((dotgrid.cursor.translation.from.x * this.scale), (dotgrid.cursor.translation.from.y * this.scale))
    this.context.lineTo((dotgrid.cursor.translation.to.x * this.scale), (dotgrid.cursor.translation.to.y * this.scale))
    this.context.lineCap = 'round'
    this.context.lineWidth = 5
    this.context.strokeStyle = dotgrid.cursor.translation.multi === true ? dotgrid.theme.active.b_inv : dotgrid.cursor.translation.copy === true ? dotgrid.theme.active.f_med : dotgrid.theme.active.f_low
    this.context.setLineDash([5, 10])
    this.context.stroke()
    this.context.closePath()

    this.context.setLineDash([])
    this.context.restore()
  }

  this.drawCursor = function (pos = dotgrid.cursor.pos, radius = dotgrid.tool.style().thickness - 1) {
    this.context.save()

    this.context.beginPath()
    this.context.lineWidth = 3
    this.context.lineCap = 'round'
    this.context.arc(Math.abs(pos.x * -this.scale), Math.abs(pos.y * this.scale), 5, 0, 2 * Math.PI, false)
    this.context.strokeStyle = dotgrid.theme.active.background
    this.context.stroke()
    this.context.closePath()

    this.context.beginPath()
    this.context.lineWidth = 3
    this.context.lineCap = 'round'
    this.context.arc(Math.abs(pos.x * -this.scale), Math.abs(pos.y * this.scale), clamp(radius, 5, 100), 0, 2 * Math.PI, false)
    this.context.strokeStyle = dotgrid.theme.active.f_med
    this.context.stroke()
    this.context.closePath()

    this.context.restore()
  }

  this.drawRender = function () {
    let img = new Image()
    img.src = dotgrid.manager.svg64()
    this.context.drawImage(img, 0, 0, this.el.width, this.el.height)
  }

  this.drawDebug = function () {
    this.context.strokeRect(0, 0, this.el.width, this.el.height)
    this.context.strokeRect(this.el.width / 2, 0, this.el.width, this.el.height)
    this.context.strokeRect(0, this.el.height / 2, this.el.width, this.el.height)
  }

  function isEqual (a, b) { return a && b && Math.abs(a.x) == Math.abs(b.x) && Math.abs(a.y) == Math.abs(b.y) }
  function clamp (v, min, max) { return v < min ? min : v > max ? max : v }
}
