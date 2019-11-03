'use strict'

function Picker (dotgrid) {
  this.memory = ''
  this.el = document.createElement('div')
  this.el.id = 'picker'
  this.isActive = false
  this.input = document.createElement('input')
  this.input.id = 'picker_input'

  this.el.appendChild(this.input)

  this.start = function () {
    if (this.isActive) { return }

    this.isActive = true

    this.input.setAttribute('placeholder', `${dotgrid.tool.style().color.replace('#', '').trim()}`)
    this.input.setAttribute('maxlength', 6)

    this.input.addEventListener('keydown', this.onKeyDown, false)
    this.input.addEventListener('keyup', this.onKeyUp, false)

    dotgrid.interface.el.className = 'picker'
    this.input.focus()
    this.input.value = ''

    try { dotgrid.controller.set('picker') } catch (err) { }
  }

  this.update = function () {
    if (!this.isActive) { return }
    if (!isColor(this.input.value)) { return }

    const hex = `#${this.input.value}`

    document.getElementById('option_color').children[0].style.fill = hex
    document.getElementById('option_color').children[0].style.stroke = hex
  }

  this.stop = function () {
    if (!this.isActive) { return }

    this.isActive = false

    dotgrid.interface.el.className = ''
    this.input.blur()
    this.input.value = ''

    try { dotgrid.controller.set() } catch (err) { console.log('No controller') }

    setTimeout(() => { dotgrid.interface.update(true); dotgrid.renderer.update() }, 250)
  }

  this.validate = function () {
    if (!isColor(this.input.value)) { return }

    const hex = `#${this.input.value}`

    dotgrid.tool.style().color = hex
    dotgrid.tool.style().fill = dotgrid.tool.style().fill !== 'none' ? hex : 'none'

    this.stop()
  }

  function isColor (val) {
    if (val.length !== 3 && val.length !== 6) {
      return false
    }

    const re = /[0-9A-Fa-f]/g
    return re.test(val)
  }

  this.onKeyDown = (e) => {
    if (e.key === 'Enter') {
      this.validate()
      e.preventDefault()
      return
    }
    if (e.key === 'Escape') {
      this.stop()
      e.preventDefault()
      return
    }
    e.stopPropagation()
  }

  this.onKeyUp = (e) => {
    e.stopPropagation()
    this.update()
  }
}
