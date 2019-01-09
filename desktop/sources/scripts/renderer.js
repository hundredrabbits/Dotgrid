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
    this.drawRender()
    this.drawGrid()
    this.drawVertices()
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
    dotgrid.interface.update(true)
  }

  this.resize = function (size) {
    this.el.width = size.width * this.scale
    this.el.height = size.height * this.scale
    this.el.style.width = size.width + 'px'
    this.el.style.height = size.height + 'px'

    this.update()
  }

  // Collections

  this.drawMirror = function () {
    if (!this.showExtras) { return }

    if (dotgrid.tool.style().mirror_style === 0) { return }

    const middle = { x: dotgrid.tool.settings.size.width + (dotgrid.grid_width), y: dotgrid.tool.settings.size.height + (this.scale * dotgrid.grid_height) }

    if (dotgrid.tool.style().mirror_style === 1 || dotgrid.tool.style().mirror_style === 3) {
      this.drawRule({ x: middle.x, y: dotgrid.grid_height * this.scale }, { x: middle.x, y: (dotgrid.tool.settings.size.height + dotgrid.grid_height) * this.scale })
    }
    if (dotgrid.tool.style().mirror_style === 2 || dotgrid.tool.style().mirror_style === 3) {
      this.drawRule({ x: dotgrid.grid_width * this.scale, y: middle.y }, { x: (dotgrid.tool.settings.size.width + dotgrid.grid_width) * this.scale, y: middle.y })
    }
  }

  this.drawHandles = function () {
    if (!this.showExtras) { return }

    for (const segment_id in dotgrid.tool.layer()) {
      const segment = dotgrid.tool.layer()[segment_id]
      for (const vertex_id in segment.vertices) {
        const vertex = segment.vertices[vertex_id]
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

    const cursor = { x: parseInt(dotgrid.cursor.pos.x / dotgrid.grid_width), y: parseInt(dotgrid.cursor.pos.y / dotgrid.grid_width) }

    for (let x = dotgrid.grid_x - 1; x >= 0; x--) {
      for (let y = dotgrid.grid_y; y >= 0; y--) {
        let is_step = x % dotgrid.block_x == 0 && y % dotgrid.block_y == 0
        // Color
        let color = is_step ? dotgrid.theme.active.b_med : dotgrid.theme.active.b_low
        if ((y == 0 || y == dotgrid.grid_y) && cursor.x == x + 1) { color = dotgrid.theme.active.b_high } else if ((x == 0 || x == dotgrid.grid_x - 1) && cursor.y == y + 1) { color = dotgrid.theme.active.b_high } else if (cursor.x == x + 1 && cursor.y == y + 1) { color = dotgrid.theme.active.b_high }

        this.drawMarker({
          x: parseInt(x * dotgrid.grid_width) + dotgrid.grid_width,
          y: parseInt(y * dotgrid.grid_height) + dotgrid.grid_height
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

  // Elements

  this.drawMarker = function (pos, radius = 1, color) {
    let ctx = this.el.getContext('2d')
    ctx.beginPath()
    ctx.lineWidth = 2
    ctx.arc(pos.x * this.scale, pos.y * this.scale, radius, 0, 2 * Math.PI, false)
    ctx.fillStyle = color
    ctx.fill()
    ctx.closePath()
  }

  this.drawVertex = function (pos, radius = 5) {
    let ctx = this.el.getContext('2d')
    ctx.beginPath()
    ctx.lineWidth = 2
    ctx.arc((pos.x * this.scale), (pos.y * this.scale), radius, 0, 2 * Math.PI, false)
    ctx.fillStyle = dotgrid.theme.active.f_med
    ctx.fill()
    ctx.closePath()
  }

  this.drawRule = function (from, to) {
    let ctx = this.el.getContext('2d')

    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
    ctx.lineCap = 'round'
    ctx.lineWidth = 3
    ctx.strokeStyle = dotgrid.theme.active.b_low
    ctx.stroke()
    ctx.closePath()
  }

  this.drawHandle = function (pos, radius = 6) {
    let ctx = this.el.getContext('2d')

    ctx.beginPath()
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.arc(Math.abs(pos.x * -this.scale), Math.abs(pos.y * this.scale), radius + 3, 0, 2 * Math.PI, false)
    ctx.fillStyle = dotgrid.theme.active.f_high
    ctx.fill()
    ctx.strokeStyle = dotgrid.theme.active.f_high
    ctx.stroke()
    ctx.closePath()

    ctx.beginPath()
    ctx.arc((pos.x * this.scale), (pos.y * this.scale), radius, 0, 2 * Math.PI, false)
    ctx.fillStyle = dotgrid.theme.active.f_low
    ctx.fill()
    ctx.closePath()

    ctx.beginPath()
    ctx.arc((pos.x * this.scale), (pos.y * this.scale), radius - 3, 0, 2 * Math.PI, false)
    ctx.fillStyle = dotgrid.theme.active.f_high
    ctx.fill()
    ctx.closePath()
  }

  this.drawPath = function (path, style) {
    let ctx = this.el.getContext('2d')
    let p = new Path2D(path)

    ctx.strokeStyle = style.color
    ctx.lineWidth = style.thickness * this.scale
    ctx.lineCap = style.strokeLinecap
    ctx.lineJoin = style.strokeLinejoin

    if (style.fill && style.fill != 'none') {
      ctx.fillStyle = style.color
      ctx.fill(p)
    }

    // Dash
    if (style.strokeLineDash) { ctx.setLineDash(style.strokeLineDash) } else { ctx.setLineDash([]) }
    ctx.stroke(p)
  }

  this.drawTranslation = function () {
    if (!dotgrid.cursor.translation) { return }

    let ctx = this.el.getContext('2d')

    ctx.beginPath()
    ctx.moveTo((dotgrid.cursor.translation.from.x * this.scale), (dotgrid.cursor.translation.from.y * this.scale))
    ctx.lineTo((dotgrid.cursor.translation.to.x * this.scale), (dotgrid.cursor.translation.to.y * this.scale))
    ctx.lineCap = 'round'
    ctx.lineWidth = 5
    ctx.strokeStyle = dotgrid.cursor.translation.multi === true ? dotgrid.theme.active.b_inv : dotgrid.cursor.translation.copy === true ? dotgrid.theme.active.f_med : dotgrid.theme.active.f_low
    ctx.setLineDash([5, 10])
    ctx.stroke()
    ctx.closePath()

    ctx.setLineDash([])
    ctx.restore()
  }

  this.drawCursor = function (pos = dotgrid.cursor.pos, radius = dotgrid.tool.style().thickness - 1) {
    let ctx = this.el.getContext('2d')

    ctx.beginPath()
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.arc(Math.abs(pos.x * -this.scale), Math.abs(pos.y * this.scale), 5, 0, 2 * Math.PI, false)
    ctx.strokeStyle = dotgrid.theme.active.background
    ctx.stroke()
    ctx.closePath()

    ctx.beginPath()
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.arc(Math.abs(pos.x * -this.scale), Math.abs(pos.y * this.scale), clamp(radius, 5, 100), 0, 2 * Math.PI, false)
    ctx.strokeStyle = dotgrid.theme.active.f_med
    ctx.stroke()
    ctx.closePath()
  }

  this.drawPreview = function () {
    let ctx = this.el.getContext('2d')
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

    ctx.setLineDash([])
    ctx.restore()
  }

  this.drawRender = function (ctx = this.context) {
    let img = new Image()
    img.src = dotgrid.manager.svg64()
    this.context.drawImage(img, 0, 0, this.el.width, this.el.height)
  }

  function isEqual (a, b) { return a && b && Math.abs(a.x) == Math.abs(b.x) && Math.abs(a.y) == Math.abs(b.y) }
  function clamp (v, min, max) { return v < min ? min : v > max ? max : v }
}
