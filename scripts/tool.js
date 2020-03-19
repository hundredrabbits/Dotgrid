'use strict'

/* global Generator */

function Tool (client) {
  this.index = 0
  this.settings = { size: { width: 600, height: 300 } }
  this.layers = [[], [], []]
  this.styles = [
    { thickness: 15, strokeLinecap: 'round', strokeLinejoin: 'round', color: '#f00', fill: 'none', mask: false, mirror_style: 0, transform: 'rotate(45)' },
    { thickness: 15, strokeLinecap: 'round', strokeLinejoin: 'round', color: '#0f0', fill: 'none', mask: false, mirror_style: 0, transform: 'rotate(45)' },
    { thickness: 15, strokeLinecap: 'round', strokeLinejoin: 'round', color: '#00f', fill: 'none', mask: false, mirror_style: 0, transform: 'rotate(45)' }
  ]
  this.vertices = []
  this.reqs = { line: 2, arc_c: 2, arc_r: 2, arc_c_full: 2, arc_r_full: 2, bezier: 3, close: 0 }

  this.start = function () {
    this.styles[0].color = client.theme.active.f_high
    this.styles[1].color = client.theme.active.f_med
    this.styles[2].color = client.theme.active.f_low
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

  this.erase = function () {
    this.layers = [[], [], []]
    this.vertices = []
    client.renderer.update()
    client.interface.update(true)
  }

  this.clear = function () {
    this.vertices = []
    client.renderer.update()
    client.interface.update(true)
  }

  this.undo = function () {
    this.layers = client.history.prev()
    client.renderer.update()
    client.interface.update(true)
  }

  this.redo = function () {
    this.layers = client.history.next()
    client.renderer.update()
    client.interface.update(true)
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
    client.history.push(this.layers)
    this.clear()
    client.renderer.update()
    client.interface.update(true)
  }

  this.replace = function (dot) {
    if (!dot.layers || dot.layers.length !== 3) { console.warn('Incompatible version'); return }

    if (dot.settings.width && dot.settings.height) {
      dot.settings.size = { width: dot.settings.width, height: dot.settings.height }
    }

    this.layers = dot.layers
    this.styles = dot.styles
    this.settings = dot.settings

    this.clear()
    client.fitSize()
    client.renderer.update()
    client.interface.update(true)
    client.history.push(this.layers)
  }

  // EDIT

  this.removeSegment = function () {
    if (this.vertices.length > 0) { this.clear(); return }

    this.layer().pop()
    this.clear()
    client.renderer.update()
    client.interface.update(true)
  }

  this.removeSegmentsAt = function (pos) {
    for (const segmentId in this.layer()) {
      const segment = this.layer()[segmentId]
      for (const vertexId in segment.vertices) {
        const vertex = segment.vertices[vertexId]
        if (Math.abs(pos.x) === Math.abs(vertex.x) && Math.abs(pos.y) === Math.abs(vertex.y)) {
          segment.vertices.splice(vertexId, 1)
        }
      }
      if (segment.vertices.length < 2) {
        this.layers[this.index].splice(segmentId, 1)
      }
    }
    this.clear()
    client.renderer.update()
    client.interface.update(true)
  }

  this.selectSegmentAt = function (pos, source = this.layer()) {
    for (const segmentId in source) {
      const segment = source[segmentId]
      for (const vertexId in segment.vertices) {
        const vertex = segment.vertices[vertexId]
        if (vertex.x === Math.abs(pos.x) && vertex.y === Math.abs(pos.y)) {
          return segment
        }
      }
    }
    return null
  }

  this.addVertex = function (pos) {
    pos = { x: Math.abs(pos.x), y: Math.abs(pos.y) }
    this.vertices.push(pos)
    client.interface.update(true)
  }

  this.vertexAt = function (pos) {
    for (const segmentId in this.layer()) {
      const segment = this.layer()[segmentId]
      for (const vertexId in segment.vertices) {
        const vertex = segment.vertices[vertexId]
        if (vertex.x === Math.abs(pos.x) && vertex.y === Math.abs(pos.y)) {
          return vertex
        }
      }
    }
    return null
  }

  this.addSegment = function (type, vertices, index = this.index) {
    const appendTarget = this.canAppend({ type: type, vertices: vertices }, index)
    if (appendTarget) {
      this.layer(index)[appendTarget].vertices = this.layer(index)[appendTarget].vertices.concat(vertices)
    } else {
      this.layer(index).push({ type: type, vertices: vertices })
    }
  }

  this.cast = function (type) {
    if (!this.layer()) { this.layers[this.index] = [] }
    if (!this.canCast(type)) { console.warn('Cannot cast'); return }

    this.addSegment(type, this.vertices.slice())

    client.history.push(this.layers)

    this.clear()
    client.renderer.update()
    client.interface.update(true)

    console.log(`Casted ${type} -> ${this.layer().length} elements`)
  }

  this.i = { linecap: 0, linejoin: 0, thickness: 5 }

  this.toggle = function (type, mod = 1) {
    if (type === 'linecap') {
      const a = ['butt', 'square', 'round']
      this.i.linecap += mod
      this.style().strokeLinecap = a[this.i.linecap % a.length]
    } else if (type === 'linejoin') {
      const a = ['miter', 'round', 'bevel']
      this.i.linejoin += mod
      this.style().strokeLinejoin = a[this.i.linejoin % a.length]
    } else if (type === 'fill') {
      this.style().fill = this.style().fill === 'none' ? this.style().color : 'none'
    } else if (type === 'mask') {
      this.style().mask = !this.style().mask
    } else if (type === 'thickness') {
      this.style().thickness = clamp(this.style().thickness + mod, 1, 100)
    } else if (type === 'mirror') {
      this.style().mirror_style = this.style().mirror_style > 2 ? 0 : this.style().mirror_style + 1
    } else {
      console.warn('Unknown', type)
    }
    client.interface.update(true)
    client.renderer.update()
  }

  this.misc = function (type) {
    client.picker.start()
  }

  this.source = function (type) {
    if (type === 'grid') { client.renderer.toggle() }
    if (type === 'open') { client.source.open('grid', client.whenOpen) }
    if (type === 'save') { client.source.write('dotgrid', 'grid', client.tool.export(), 'text/plain') }
    if (type === 'export') { client.source.write('dotgrid', 'svg', client.manager.toString(), 'image/svg+xml') }
    if (type === 'render') { client.manager.toPNG(client.tool.settings.size, (dataUrl) => { client.source.write('dotgrid', 'png', dataUrl, 'image/png') }) }
  }

  this.canAppend = function (content, index = this.index) {
    for (const id in this.layer(index)) {
      const stroke = this.layer(index)[id]
      if (stroke.type !== content.type) { continue }
      if (!stroke.vertices) { continue }
      if (!stroke.vertices[stroke.vertices.length - 1]) { continue }
      if (stroke.vertices[stroke.vertices.length - 1].x !== content.vertices[0].x) { continue }
      if (stroke.vertices[stroke.vertices.length - 1].y !== content.vertices[0].y) { continue }
      return id
    }
    return false
  }

  this.canCast = function (type) {
    if (!type) { return false }
    // Cannot cast close twice
    if (type === 'close') {
      const prev = this.layer()[this.layer().length - 1]
      if (!prev || prev.type === 'close' || this.vertices.length !== 0) {
        return false
      }
    }
    if (type === 'bezier') {
      if (this.vertices.length !== 3 && this.vertices.length !== 5 && this.vertices.length !== 7 && this.vertices.length !== 9) {
        return false
      }
    }
    return this.vertices.length >= this.reqs[type]
  }

  this.paths = function () {
    const l1 = new Generator(client.tool.layers[0], client.tool.styles[0]).toString({ x: 0, y: 0 }, 1)
    const l2 = new Generator(client.tool.layers[1], client.tool.styles[1]).toString({ x: 0, y: 0 }, 1)
    const l3 = new Generator(client.tool.layers[2], client.tool.styles[2]).toString({ x: 0, y: 0 }, 1)

    return [l1, l2, l3]
  }

  this.path = function () {
    return new Generator(client.tool.layer(), client.tool.style()).toString({ x: 0, y: 0 }, 1)
  }

  this.translate = function (a, b) {
    for (const segmentId in this.layer()) {
      const segment = this.layer()[segmentId]
      for (const vertexId in segment.vertices) {
        const vertex = segment.vertices[vertexId]
        if (vertex.x === Math.abs(a.x) && vertex.y === Math.abs(a.y)) {
          segment.vertices[vertexId] = { x: Math.abs(b.x), y: Math.abs(b.y) }
        }
      }
    }
    client.history.push(this.layers)
    this.clear()
    client.renderer.update()
  }

  this.translateMulti = function (a, b) {
    const offset = { x: a.x - b.x, y: a.y - b.y }
    const segment = this.selectSegmentAt(a)

    if (!segment) { return }

    for (const vertexId in segment.vertices) {
      const vertex = segment.vertices[vertexId]
      segment.vertices[vertexId] = { x: vertex.x - offset.x, y: vertex.y - offset.y }
    }

    client.history.push(this.layers)
    this.clear()
    client.renderer.update()
  }

  this.translateLayer = function (a, b) {
    const offset = { x: a.x - b.x, y: a.y - b.y }
    for (const segmentId in this.layer()) {
      const segment = this.layer()[segmentId]
      for (const vertexId in segment.vertices) {
        const vertex = segment.vertices[vertexId]
        segment.vertices[vertexId] = { x: vertex.x - offset.x, y: vertex.y - offset.y }
      }
    }
    client.history.push(this.layers)
    this.clear()
    client.renderer.update()
  }

  this.translateCopy = function (a, b) {
    const offset = { x: a.x - b.x, y: a.y - b.y }
    const segment = this.selectSegmentAt(a, copy(this.layer()))

    if (!segment) { return }

    for (const vertexId in segment.vertices) {
      const vertex = segment.vertices[vertexId]
      segment.vertices[vertexId] = { x: vertex.x - offset.x, y: vertex.y - offset.y }
    }
    this.layer().push(segment)

    client.history.push(this.layers)
    this.clear()
    client.renderer.update()
  }

  this.merge = function () {
    const merged = [].concat(this.layers[0]).concat(this.layers[1]).concat(this.layers[2])
    this.erase()
    this.layers[this.index] = merged

    client.history.push(this.layers)
    this.clear()
    client.renderer.update()
  }

  // Style

  this.style = function () {
    if (!this.styles[this.index]) {
      this.styles[this.index] = []
    }
    return this.styles[this.index]
  }

  // Layers

  this.layer = function (index = this.index) {
    if (!this.layers[index]) {
      this.layers[index] = []
    }
    return this.layers[index]
  }

  this.selectLayer = function (id) {
    this.index = clamp(id, 0, 2)
    this.clear()
    client.renderer.update()
    client.interface.update(true)
    console.log(`layer:${this.index}`)
  }

  this.selectNextLayer = function () {
    this.index = this.index >= 2 ? 0 : this.index++
    this.selectLayer(this.index)
  }

  this.selectPrevLayer = function () {
    this.index = this.index >= 0 ? 2 : this.index--
    this.selectLayer(this.index)
  }

  function copy (data) { return data ? JSON.parse(JSON.stringify(data)) : [] }
  function clamp (v, min, max) { return v < min ? min : v > max ? max : v }
}
