'use strict'

function Cursor () {
  this.pos = { x: 0, y: 0 }
  this.translation = null
  this.operation = null

  this.translate = function (from = null, to = null, multi = false, copy = false, layer = false) {
    if ((from || to) && this.translation == null) { this.translation = { multi: multi, copy: copy, layer: layer } }

    if (from) { this.translation.from = from }
    if (to) { this.translation.to = to }

    if (!from && !to) {
      this.translation = null
    }
  }

  this.down = function (e) {
    this.pos = this.atEvent(e)

    // Translation
    if (DOTGRID.tool.vertexAt(this.pos)) {
      this.translate(this.pos, this.pos, e.shiftKey, e.ctrlKey || e.metaKey, e.altKey)
    }

    DOTGRID.renderer.update()
    DOTGRID.interface.update()
    e.preventDefault()
  }

  this.last_pos = { x: 0, y: 0 }

  this.move = function (e) {
    this.pos = this.atEvent(e)

    // Translation
    if (this.translation) {
      this.translate(null, this.pos)
    }

    if (this.last_pos.x != this.pos.x || this.last_pos.y != this.pos.y) {
      DOTGRID.renderer.update()
    }

    DOTGRID.interface.update()
    e.preventDefault()

    this.last_pos = this.pos
  }

  this.up = function (e) {
    this.pos = this.atEvent(e)

    if (this.translation && !is_equal(this.translation.from, this.translation.to)) {
      if (this.translation.layer === true) { DOTGRID.tool.translateLayer(this.translation.from, this.translation.to) } else if (this.translation.copy) { DOTGRID.tool.translateCopy(this.translation.from, this.translation.to) } else if (this.translation.multi) { DOTGRID.tool.translateMulti(this.translation.from, this.translation.to) } else { DOTGRID.tool.translate(this.translation.from, this.translation.to) }
    } else if (e.target.id == 'guide') {
      DOTGRID.tool.addVertex({ x: this.pos.x, y: this.pos.y })
      DOTGRID.picker.stop()
    }

    this.translate()

    DOTGRID.interface.update()
    DOTGRID.renderer.update()
    e.preventDefault()
  }

  this.alt = function (e) {
    this.pos = this.atEvent(e)

    DOTGRID.tool.removeSegmentsAt(this.pos)
    e.preventDefault()

    setTimeout(() => { DOTGRID.tool.clear() }, 150)
  }

  // Position Mods

  this.atEvent = function (e) {
    return this.snapPos(this.relativePos({ x: e.clientX, y: e.clientY }))
  }

  this.relativePos = function (pos) {
    return {
      x: pos.x - DOTGRID.renderer.el.offsetLeft,
      y: pos.y - DOTGRID.renderer.el.offsetTop
    }
  }

  this.snapPos = function (pos) {
    return {
      x: clamp(step(pos.x, 15), 15, DOTGRID.tool.settings.size.width),
      y: clamp(step(pos.y, 15), 15, DOTGRID.tool.settings.size.height)
    }
  }

  function is_equal (a, b) { return a.x == b.x && a.y == b.y }
}
