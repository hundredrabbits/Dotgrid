'use strict'

function Cursor (dotgrid) {
  this.pos = { x: 0, y: 0 }
  this.translation = null
  this.operation = null

  this.translate = function (from = null, to = null, multi = false, copy = false, layer = false) {
    if ((from || to) && this.translation === null) { this.translation = { multi: multi, copy: copy, layer: layer } }

    if (from) { this.translation.from = from }
    if (to) { this.translation.to = to }

    if (!from && !to) {
      this.translation = null
    }
  }

  this.down = function (e) {
    this.pos = this.atEvent(e)

    // Translation
    if (dotgrid.tool.vertexAt(this.pos)) {
      this.translate(this.pos, this.pos, e.shiftKey, e.ctrlKey || e.metaKey, e.altKey)
    }

    dotgrid.renderer.update()
    dotgrid.interface.update()
    e.preventDefault()
  }

  this.last_pos = { x: 0, y: 0 }

  this.move = function (e) {
    this.pos = this.atEvent(e)

    // Translation
    if (this.translation) {
      this.translate(null, this.pos)
    }

    if (this.last_pos.x !== this.pos.x || this.last_pos.y !== this.pos.y) {
      dotgrid.renderer.update()
    }

    dotgrid.interface.update()
    e.preventDefault()

    this.last_pos = this.pos
  }

  this.up = function (e) {
    this.pos = this.atEvent(e)

    if (this.translation && !isEqual(this.translation.from, this.translation.to)) {
      if (this.translation.layer === true) { dotgrid.tool.translateLayer(this.translation.from, this.translation.to) } else if (this.translation.copy) { dotgrid.tool.translateCopy(this.translation.from, this.translation.to) } else if (this.translation.multi) { dotgrid.tool.translateMulti(this.translation.from, this.translation.to) } else { dotgrid.tool.translate(this.translation.from, this.translation.to) }
    } else if (e.target.id === 'guide') {
      dotgrid.tool.addVertex({ x: this.pos.x, y: this.pos.y })
      dotgrid.picker.stop()
    }

    this.translate()

    dotgrid.interface.update()
    dotgrid.renderer.update()
    e.preventDefault()
  }

  this.alt = function (e) {
    this.pos = this.atEvent(e)

    dotgrid.tool.removeSegmentsAt(this.pos)
    e.preventDefault()

    setTimeout(() => { dotgrid.tool.clear() }, 150)
  }

  // Position Mods

  this.atEvent = function (e) {
    return this.snapPos(this.relativePos({ x: e.clientX, y: e.clientY }))
  }

  this.relativePos = function (pos) {
    return {
      x: pos.x - dotgrid.renderer.el.offsetLeft,
      y: pos.y - dotgrid.renderer.el.offsetTop
    }
  }

  this.snapPos = function (pos) {
    return {
      x: clamp(step(pos.x, 15), 15, dotgrid.tool.settings.size.width - 15),
      y: clamp(step(pos.y, 15), 15, dotgrid.tool.settings.size.height - 15)
    }
  }

  function isEqual (a, b) { return a.x === b.x && a.y === b.y }
  function clamp (v, min, max) { return v < min ? min : v > max ? max : v }
  function step (v, s) { return Math.round(v / s) * s }
}
