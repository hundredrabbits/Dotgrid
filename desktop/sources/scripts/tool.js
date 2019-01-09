'use strict'

DOTGRID.Tool = function () {
  this.index = 0
  this.settings = { size: { width: 300, height: 300 } }
  this.layers = [[], [], []]
  this.styles = [
    { thickness: 10, strokeLinecap: 'round', strokeLinejoin: 'round', color: '#f00', fill: 'none', mirror_style: 0, transform: 'rotate(45)' },
    { thickness: 10, strokeLinecap: 'round', strokeLinejoin: 'round', color: '#0f0', fill: 'none', mirror_style: 0, transform: 'rotate(45)' },
    { thickness: 10, strokeLinecap: 'round', strokeLinejoin: 'round', color: '#00f', fill: 'none', mirror_style: 0, transform: 'rotate(45)' }
  ]
  this.vertices = []
  this.reqs = { line: 2, arc_c: 2, arc_r: 2, arc_c_full: 2, arc_r_full: 2, bezier: 3, close: 0 }

  this.start = function () {
    this.styles[0].color = DOTGRID.theme.active.f_high
    this.styles[1].color = DOTGRID.theme.active.f_med
    this.styles[2].color = DOTGRID.theme.active.f_low
  }

  this.erase = function () {
    this.layers = [[], [], []]
  }

  this.reset = function () {
    this.styles[0].mirror_style = 0
    this.styles[1].mirror_style = 0
    this.styles[2].mirror_style = 0
    this.styles[0].fill = 'none'
    this.styles[1].fill = 'none'
    this.styles[2].fill = 'none'
    this.erase()
    this.vertices = []
    this.index = 0
  }

  this.clear = function () {
    this.vertices = []
    DOTGRID.renderer.update()
    DOTGRID.interface.update(true)
  }

  this.undo = function () {
    this.layers = DOTGRID.history.prev()
    DOTGRID.renderer.update()
    DOTGRID.interface.update(true)
  }

  this.redo = function () {
    this.layers = DOTGRID.history.next()
    DOTGRID.renderer.update()
    DOTGRID.interface.update(true)
  }

  this.length = function () {
    return this.layers[0].length + this.layers[1].length + this.layers[2].length
  }

  // I/O

  this.export = function (target = { settings: this.settings, layers: this.layers, styles: this.styles }) {
    return JSON.stringify(copy(target), null, 2)
  }

  this.import = function (layer) {
    this.layers[this.index] = this.layers[this.index].concat(layer)
    DOTGRID.history.push(this.layers)
    this.clear()
    DOTGRID.renderer.update()
    DOTGRID.interface.update(true)
  }

  this.replace = function (dot) {
    if (!dot.layers || dot.layers.length != 3) { console.warn('Incompatible version'); return }

    if (dot.settings.width && dot.settings.height) {
      dot.settings.size = { width: dot.settings.width, height: dot.settings.height }
    }
    if (this.settings && (this.settings.size.width != dot.settings.size.width || this.settings.size.height != dot.settings.size.height)) {
      DOTGRID.setSize({ width: dot.settings.size.width, height: dot.settings.size.height })
    }

    this.layers = dot.layers
    this.styles = dot.styles
    this.settings = dot.settings

    this.clear()
    DOTGRID.renderer.update()
    DOTGRID.interface.update(true)
    DOTGRID.history.push(this.layers)
  }

  // EDIT

  this.remove_segment = function () {
    if (this.vertices.length > 0) { this.clear(); return }

    this.layer().pop()
    this.clear()
    DOTGRID.renderer.update()
    DOTGRID.interface.update(true)
  }

  this.remove_segments_at = function (pos) {
    for (const segment_id in this.layer()) {
      let segment = this.layer()[segment_id]
      for (const vertex_id in segment.vertices) {
        let vertex = segment.vertices[vertex_id]
        if (Math.abs(pos.x) == Math.abs(vertex.x) && Math.abs(pos.y) == Math.abs(vertex.y)) {
          segment.vertices.splice(vertex_id, 1)
        }
      }
      if (segment.vertices.length < 2) {
        this.layers[this.index].splice(segment_id, 1)
      }
    }
    this.clear()
    DOTGRID.renderer.update()
    DOTGRID.interface.update(true)
  }

  this.select_segment_at = function (pos, source = this.layer()) {
    let target_segment = null
    for (const segment_id in source) {
      let segment = source[segment_id]
      for (const vertex_id in segment.vertices) {
        let vertex = segment.vertices[vertex_id]
        if (vertex.x == Math.abs(pos.x) && vertex.y == Math.abs(pos.y)) {
          return segment
        }
      }
    }
    return null
  }

  this.add_vertex = function (pos) {
    pos = { x: Math.abs(pos.x), y: Math.abs(pos.y) }
    this.vertices.push(pos)
    DOTGRID.interface.update(true)
  }

  this.vertex_at = function (pos) {
    for (const segment_id in this.layer()) {
      let segment = this.layer()[segment_id]
      for (const vertex_id in segment.vertices) {
        let vertex = segment.vertices[vertex_id]
        if (vertex.x == Math.abs(pos.x) && vertex.y == Math.abs(pos.y)) {
          return vertex
        }
      }
    }
    return null
  }

  this.add_segment = function (type, vertices) {
    let append_target = this.can_append({ type: type, vertices: vertices })
    if (append_target) {
      this.layer()[append_target].vertices = this.layer()[append_target].vertices.concat(vertices)
    } else {
      this.layer().push({ type: type, vertices: vertices })
    }
  }

  this.cast = function (type) {
    if (!this.layer()) { this.layers[this.index] = [] }
    if (!this.canCast(type)) { console.warn('Cannot cast'); return }

    this.add_segment(type, this.vertices.slice())

    DOTGRID.history.push(this.layers)

    this.clear()
    DOTGRID.renderer.update()
    DOTGRID.interface.update(true)

    console.log(`Casted ${type} -> ${this.layer().length} elements`)
  }

  this.i = { linecap: 0, linejoin: 0, thickness: 5 }

  this.toggle = function (type, mod = 1) {
    if (type == 'linecap') {
      let a = ['butt', 'square', 'round']
      this.i.linecap += mod
      this.style().strokeLinecap = a[this.i.linecap % a.length]
    } else if (type == 'linejoin') {
      let a = ['miter', 'round', 'bevel']
      this.i.linejoin += mod
      this.style().strokeLinejoin = a[this.i.linejoin % a.length]
    } else if (type == 'fill') {
      this.style().fill = this.style().fill == 'none' ? this.style().color : 'none'
    } else if (type == 'thickness') {
      this.style().thickness = clamp(this.style().thickness + mod, 1, 100)
    } else if (type == 'mirror') {
      this.style().mirror_style = this.style().mirror_style > 2 ? 0 : this.style().mirror_style + 1
    } else {
      console.warn('Unknown', type)
    }
    DOTGRID.interface.update(true)
    DOTGRID.renderer.update()
  }

  this.misc = function (type) {
    DOTGRID.picker.start()
  }

  this.source = function (type) {
    if (type == 'grid') { DOTGRID.renderer.toggle() }
    if (type == 'screen') { app.toggle_fullscreen() }

    if (type == 'open') { DOTGRID.open() }
    if (type == 'save') { DOTGRID.save() }
    if (type == 'render') { DOTGRID.render() }
    if (type == 'export') { DOTGRID.export() }
  }

  this.can_append = function (content) {
    for (const id in this.layer()) {
      let stroke = this.layer()[id]
      if (stroke.type != content.type) { continue }
      if (!stroke.vertices) { continue }
      if (!stroke.vertices[stroke.vertices.length - 1]) { continue }
      if (stroke.vertices[stroke.vertices.length - 1].x != content.vertices[0].x) { continue }
      if (stroke.vertices[stroke.vertices.length - 1].y != content.vertices[0].y) { continue }
      return id
    }
    return false
  }

  this.canCast = function (type) {
    if (!type) { return false }
    // Cannot cast close twice
    if (type == 'close') {
      let prev = this.layer()[this.layer().length - 1]
      if (!prev || prev.type == 'close') {
        return false
      }
    }
    if (type == 'bezier') {
      if (this.vertices.length != 3 && this.vertices.length != 5 && this.vertices.length != 7 && this.vertices.length != 9) {
        return false
      }
    }
    return this.vertices.length >= this.reqs[type]
  }

  this.paths = function () {
    let l1 = new Generator(DOTGRID.tool.layers[0], DOTGRID.tool.styles[0]).toString({ x: -10, y: -10 }, 1)
    let l2 = new Generator(DOTGRID.tool.layers[1], DOTGRID.tool.styles[1]).toString({ x: -10, y: -10 }, 1)
    let l3 = new Generator(DOTGRID.tool.layers[2], DOTGRID.tool.styles[2]).toString({ x: -10, y: -10 }, 1)

    return [l1, l2, l3]
  }

  this.path = function () {
    return new Generator(DOTGRID.tool.layer(), DOTGRID.tool.style()).toString({ x: -10, y: -10 }, 1)
  }

  this.translate = function (a, b) {
    for (const segment_id in this.layer()) {
      let segment = this.layer()[segment_id]
      for (const vertex_id in segment.vertices) {
        let vertex = segment.vertices[vertex_id]
        if (vertex.x == Math.abs(a.x) && vertex.y == Math.abs(a.y)) {
          segment.vertices[vertex_id] = { x: Math.abs(b.x), y: Math.abs(b.y) }
        }
      }
    }
    DOTGRID.history.push(this.layers)
    this.clear()
    DOTGRID.renderer.update()
  }

  this.translate_multi = function (a, b) {
    const offset = { x: a.x - b.x, y: a.y - b.y }
    const segment = this.select_segment_at(a)

    if (!segment) { return }

    for (const vertex_id in segment.vertices) {
      let vertex = segment.vertices[vertex_id]
      segment.vertices[vertex_id] = { x: vertex.x - offset.x, y: vertex.y - offset.y }
    }

    DOTGRID.history.push(this.layers)
    this.clear()
    DOTGRID.renderer.update()
  }

  this.translate_layer = function (a, b) {
    console.log(a, b)
    const offset = { x: a.x - b.x, y: a.y - b.y }
    for (const segment_id in this.layer()) {
      let segment = this.layer()[segment_id]
      for (const vertex_id in segment.vertices) {
        let vertex = segment.vertices[vertex_id]
        segment.vertices[vertex_id] = { x: vertex.x - offset.x, y: vertex.y - offset.y }
      }
    }
    DOTGRID.history.push(this.layers)
    this.clear()
    DOTGRID.renderer.update()
  }

  this.translate_copy = function (a, b) {
    const offset = { x: a.x - b.x, y: a.y - b.y }
    const segment = this.select_segment_at(a, copy(this.layer()))

    if (!segment) { return }

    for (const vertex_id in segment.vertices) {
      let vertex = segment.vertices[vertex_id]
      segment.vertices[vertex_id] = { x: vertex.x - offset.x, y: vertex.y - offset.y }
    }
    this.layer().push(segment)

    DOTGRID.history.push(this.layers)
    this.clear()
    DOTGRID.renderer.update()
  }

  this.merge = function () {
    const merged = [].concat(this.layers[0]).concat(this.layers[1]).concat(this.layers[2])
    this.erase()
    this.layers[this.index] = merged

    DOTGRID.history.push(this.layers)
    this.clear()
    DOTGRID.renderer.update()
  }

  // Style

  this.style = function () {
    if (!this.styles[this.index]) {
      this.styles[this.index] = []
    }
    return this.styles[this.index]
  }

  // Layers

  this.layer = function () {
    if (!this.layers[this.index]) {
      this.layers[this.index] = []
    }
    return this.layers[this.index]
  }

  this.select_layer = function (id) {
    this.index = clamp(id, 0, 2)
    this.clear()
    DOTGRID.renderer.update()
    DOTGRID.interface.update(true)
    console.log(`layer:${this.index}`)
  }

  this.select_next_layer = function () {
    this.index = this.index >= 2 ? 0 : this.index++
    this.select_layer(this.index)
  }

  this.select_prev_layer = function () {
    this.index = this.index >= 0 ? 2 : this.index--
    this.select_layer(this.index)
  }

  function copy (data) { return data ? JSON.parse(JSON.stringify(data)) : [] }
  function clamp (v, min, max) { return v < min ? min : v > max ? max : v }
}
