'use strict'

function Cursor (client) {
  this.pos = { x: 0, y: 0 }
  this.lastPos = { x: 0, y: 0 }
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
    if (client.tool.vertexAt(this.pos)) {
      this.translate(this.pos, this.pos, e.shiftKey, e.ctrlKey || e.metaKey, e.altKey)
    }
    client.renderer.update()
    client.interface.update()
    e.preventDefault()
  }

  this.move = function (e) {
    this.pos = this.atEvent(e)
    if (this.translation) {
      this.translate(null, this.pos)
    }
    if (this.lastPos.x !== this.pos.x || this.lastPos.y !== this.pos.y) {
      client.renderer.update()
    }
    client.interface.update()
    this.lastPos = this.pos
    e.preventDefault()
  }

  this.up = function (e) {
    this.pos = this.atEvent(e)
    if (this.translation && !isEqual(this.translation.from, this.translation.to)) {
      if (this.translation.layer === true) { client.tool.translateLayer(this.translation.from, this.translation.to) } else if (this.translation.copy) { client.tool.translateCopy(this.translation.from, this.translation.to) } else if (this.translation.multi) { client.tool.translateMulti(this.translation.from, this.translation.to) } else { client.tool.translate(this.translation.from, this.translation.to) }
    } else if (e.target.id === 'guide') {
      client.tool.addVertex({ x: this.pos.x, y: this.pos.y })
      client.picker.stop()
    }
    this.translate()
    client.interface.update()
    client.renderer.update()
    e.preventDefault()
  }

  this.alt = function (e) {
    this.pos = this.atEvent(e)
    client.tool.removeSegmentsAt(this.pos)
    e.preventDefault()
    setTimeout(() => {
      client.tool.clear()
    }, 150)
  }

  this.atEvent = function (e) {
    return this.snapPos(this.relativePos({ x: e.clientX, y: e.clientY }))
  }

  this.relativePos = function (pos) {
    return {
      x: pos.x - client.renderer.el.offsetLeft,
      y: pos.y - client.renderer.el.offsetTop
    }
  }

  this.snapPosSquare = function (pos) {
    return {
      x: clamp(step(pos.x, 15), 15, client.tool.settings.size.width - 15),
      y: clamp(step(pos.y, 15), 15, client.tool.settings.size.height - 15)
    }
  }

  this.snapPosTriangle = function (pos) {
    const yScale = 10*Math.sqrt(3);
    const y = clamp(step(pos.y, yScale), yScale, client.tool.settings.size.height - yScale)
    const xRow = Math.round((y/yScale)) % 2
    const xRowShift = (xRow||-1)*5
    return {
      x: xRowShift + clamp(step(pos.x, 20), 20, client.tool.settings.size.width - 20),
      y: y
    }
  }

  this.snapPos = this.snapPosTriangle;

  function isEqual (a, b) { return a.x === b.x && a.y === b.y }
  function clamp (v, min, max) { return v < min ? min : v > max ? max : v }
  function step (v, s) { return Math.round(v / s) * s }
}
