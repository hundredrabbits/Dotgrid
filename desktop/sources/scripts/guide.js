'use strict'

DOTGRID.Guide = function () {
  this.el = document.createElement('canvas')
  this.el.id = 'guide'
  this.el.width = 640
  this.el.height = 640
  this.el.style.width = '320px'
  this.el.style.height = '320px'
  this.show_extras = true

  this.scale = 2

  this.start = function () {
    this.clear()
    this.update()
  }

  this.update = function (force = false) {
    this.clear()

    this.el.getContext('2d').restore()

    this.draw_mirror()
    this.draw_rulers()

    if (DOTGRID.tool.index == 2) { this.draw_markers(); this.draw_vertices() }
    this.draw_path(new Generator(DOTGRID.tool.layers[2], DOTGRID.tool.styles[2]).toString({ x: 0, y: 0 }, this.scale), DOTGRID.tool.styles[2])
    if (DOTGRID.tool.index == 1) { this.draw_markers(); this.draw_vertices() }
    this.draw_path(new Generator(DOTGRID.tool.layers[1], DOTGRID.tool.styles[1]).toString({ x: 0, y: 0 }, this.scale), DOTGRID.tool.styles[1])
    if (DOTGRID.tool.index == 0) { this.draw_markers(); this.draw_vertices() }
    this.draw_path(new Generator(DOTGRID.tool.layers[0], DOTGRID.tool.styles[0]).toString({ x: 0, y: 0 }, this.scale), DOTGRID.tool.styles[0])

    this.draw_handles()
    this.draw_translation()
    this.draw_cursor()
    this.draw_preview()
  }

  this.clear = function () {
    this.el.getContext('2d').clearRect(0, 0, this.el.width * this.scale, this.el.height * this.scale)
  }

  this.toggle = function () {
    this.show_extras = !this.show_extras
    this.update()
    DOTGRID.interface.update(true)
  }

  this.resize = function (size) {
    const offset = 15
    this.el.width = (size.width + offset) * this.scale
    this.el.height = (size.height + (offset * 2)) * this.scale
    this.el.style.width = (size.width + offset) + 'px'
    this.el.style.height = (size.height + (offset * 2)) + 'px'

    this.update()
  }

  this.draw_mirror = function () {
    if (!this.show_extras) { return }

    if (DOTGRID.tool.style().mirror_style === 0) { return }

    const middle = { x: DOTGRID.tool.settings.size.width + (DOTGRID.grid_width), y: DOTGRID.tool.settings.size.height + (2 * DOTGRID.grid_height) }

    if (DOTGRID.tool.style().mirror_style === 1 || DOTGRID.tool.style().mirror_style === 3) {
      this.draw_rule({ x: middle.x, y: DOTGRID.grid_height * 2 }, { x: middle.x, y: (DOTGRID.tool.settings.size.height + DOTGRID.grid_height) * 2 })
    }
    if (DOTGRID.tool.style().mirror_style === 2 || DOTGRID.tool.style().mirror_style === 3) {
      this.draw_rule({ x: DOTGRID.grid_width * 2, y: middle.y }, { x: (DOTGRID.tool.settings.size.width + DOTGRID.grid_width) * 2, y: middle.y })
    }
  }

  this.draw_handles = function () {
    if (!this.show_extras) { return }

    for (const segment_id in DOTGRID.tool.layer()) {
      const segment = DOTGRID.tool.layer()[segment_id]
      for (const vertex_id in segment.vertices) {
        const vertex = segment.vertices[vertex_id]
        this.draw_handle(vertex)
      }
    }
  }

  this.draw_vertices = function () {
    for (const id in DOTGRID.tool.vertices) {
      this.draw_vertex(DOTGRID.tool.vertices[id])
    }
  }

  this.draw_markers = function () {
    if (!this.show_extras) { return }

    const cursor = { x: parseInt(DOTGRID.cursor.pos.x / DOTGRID.grid_width), y: parseInt(DOTGRID.cursor.pos.y / DOTGRID.grid_width) }

    for (let x = DOTGRID.grid_x - 1; x >= 0; x--) {
      for (let y = DOTGRID.grid_y; y >= 0; y--) {
        let is_step = x % DOTGRID.block_x == 0 && y % DOTGRID.block_y == 0
        // Color
        let color = is_step ? DOTGRID.theme.active.b_med : DOTGRID.theme.active.b_low
        if ((y == 0 || y == DOTGRID.grid_y) && cursor.x == x + 1) { color = DOTGRID.theme.active.b_high } else if ((x == 0 || x == DOTGRID.grid_x - 1) && cursor.y == y + 1) { color = DOTGRID.theme.active.b_high } else if (cursor.x == x + 1 && cursor.y == y + 1) { color = DOTGRID.theme.active.b_high }

        this.draw_marker({
          x: parseInt(x * DOTGRID.grid_width) + DOTGRID.grid_width,
          y: parseInt(y * DOTGRID.grid_height) + DOTGRID.grid_height
        }, is_step ? 2.5 : 1.5, color)
      }
    }
  }

  this.draw_marker = function (pos, radius = 1, color) {
    let ctx = this.el.getContext('2d')
    ctx.beginPath()
    ctx.lineWidth = 2
    ctx.arc(pos.x * this.scale, pos.y * this.scale, radius, 0, 2 * Math.PI, false)
    ctx.fillStyle = color
    ctx.fill()
    ctx.closePath()
  }

  this.draw_vertex = function (pos, radius = 5) {
    let ctx = this.el.getContext('2d')
    ctx.beginPath()
    ctx.lineWidth = 2
    ctx.arc((pos.x * this.scale), (pos.y * this.scale), radius, 0, 2 * Math.PI, false)
    ctx.fillStyle = DOTGRID.theme.active.f_med
    ctx.fill()
    ctx.closePath()
  }

  this.draw_rule = function (from, to) {
    let ctx = this.el.getContext('2d')

    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
    ctx.lineCap = 'round'
    ctx.lineWidth = 3
    ctx.strokeStyle = DOTGRID.theme.active.b_low
    ctx.stroke()
    ctx.closePath()
  }

  this.draw_ruler = function (pos) {
    let offset = 15 * this.scale
    let top = offset
    let bottom = (DOTGRID.tool.settings.size.height * this.scale) + offset
    let left = offset
    let right = (DOTGRID.tool.settings.size.width * this.scale)

    // Translation
    this.draw_rule({ x: pos.x * this.scale, y: top }, { x: pos.x * this.scale, y: bottom })
    this.draw_rule({ x: left, y: pos.y * this.scale }, { x: right, y: pos.y * this.scale })
  }

  this.draw_rulers = function () {
    if (!DOTGRID.cursor.translation) { return }

    let ctx = this.el.getContext('2d')

    this.draw_ruler(DOTGRID.cursor.translation.to)

    ctx.setLineDash([])
    ctx.restore()
  }

  this.draw_handle = function (pos, radius = 6) {
    let ctx = this.el.getContext('2d')

    ctx.beginPath()
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.arc(Math.abs(pos.x * -this.scale), Math.abs(pos.y * this.scale), radius + 3, 0, 2 * Math.PI, false)
    ctx.fillStyle = DOTGRID.theme.active.f_high
    ctx.fill()
    ctx.strokeStyle = DOTGRID.theme.active.f_high
    ctx.stroke()
    ctx.closePath()

    ctx.beginPath()
    ctx.arc((pos.x * this.scale), (pos.y * this.scale), radius, 0, 2 * Math.PI, false)
    ctx.fillStyle = DOTGRID.theme.active.f_low
    ctx.fill()
    ctx.closePath()

    ctx.beginPath()
    ctx.arc((pos.x * this.scale), (pos.y * this.scale), radius - 3, 0, 2 * Math.PI, false)
    ctx.fillStyle = DOTGRID.theme.active.f_high
    ctx.fill()
    ctx.closePath()
  }

  this.draw_path = function (path, style) {
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

  this.draw_translation = function () {
    if (!DOTGRID.cursor.translation) { return }

    let ctx = this.el.getContext('2d')

    ctx.beginPath()
    ctx.moveTo((DOTGRID.cursor.translation.from.x * this.scale), (DOTGRID.cursor.translation.from.y * this.scale))
    ctx.lineTo((DOTGRID.cursor.translation.to.x * this.scale), (DOTGRID.cursor.translation.to.y * this.scale))
    ctx.lineCap = 'round'
    ctx.lineWidth = 5
    ctx.strokeStyle = DOTGRID.cursor.translation.multi === true ? DOTGRID.theme.active.b_inv : DOTGRID.cursor.translation.copy === true ? DOTGRID.theme.active.f_med : DOTGRID.theme.active.f_low
    ctx.setLineDash([5, 10])
    ctx.stroke()
    ctx.closePath()

    ctx.setLineDash([])
    ctx.restore()
  }

  this.draw_cursor = function (pos = DOTGRID.cursor.pos, radius = DOTGRID.tool.style().thickness - 1) {
    let ctx = this.el.getContext('2d')

    ctx.beginPath()
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.arc(Math.abs(pos.x * -this.scale), Math.abs(pos.y * this.scale), 5, 0, 2 * Math.PI, false)
    ctx.strokeStyle = DOTGRID.theme.active.background
    ctx.stroke()
    ctx.closePath()

    ctx.beginPath()
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.arc(Math.abs(pos.x * -this.scale), Math.abs(pos.y * this.scale), clamp(radius, 5, 100), 0, 2 * Math.PI, false)
    ctx.strokeStyle = DOTGRID.theme.active.f_med
    ctx.stroke()
    ctx.closePath()
  }

  this.draw_preview = function () {
    let ctx = this.el.getContext('2d')
    let operation = DOTGRID.cursor.operation && DOTGRID.cursor.operation.cast ? DOTGRID.cursor.operation.cast : null

    if (!DOTGRID.tool.can_cast(operation)) { return }
    if (operation == 'close') { return }

    let path = new Generator([{ vertices: DOTGRID.tool.vertices, type: operation }]).toString({ x: 0, y: 0 }, 2)
    let style = {
      color: DOTGRID.theme.active.f_med,
      thickness: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      strokeLineDash: [5, 15]
    }
    this.draw_path(path, style)

    ctx.setLineDash([])
    ctx.restore()
  }

  function isEqual (a, b) { return a && b && Math.abs(a.x) == Math.abs(b.x) && Math.abs(a.y) == Math.abs(b.y) }
  function clamp (v, min, max) { return v < min ? min : v > max ? max : v }
}
