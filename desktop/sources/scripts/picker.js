'use strict'

function Picker (client) {
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

    this.input.setAttribute('placeholder', `${client.tool.style().color.replace('#', '').trim()}`)
    this.input.setAttribute('maxlength', 6)

    this.input.addEventListener('keydown', this.onKeyDown, false)
    this.input.addEventListener('keyup', this.onKeyUp, false)

    client.interface.el.className = 'picker'
    this.input.focus()
    this.input.value = ''

    try { client.controller.set('picker') } catch (err) { }
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

    client.interface.el.className = ''
    this.input.blur()
    this.input.value = ''

    try { client.controller.set() } catch (err) { console.log('No controller') }

    setTimeout(() => { client.interface.update(true); client.renderer.update() }, 250)
  }

  this.validate = function () {
    if (!isColor(this.input.value)) { return }

    const hex = `#${this.input.value}`

    client.tool.style().color = hex
    client.tool.style().fill = client.tool.style().fill !== 'none' ? hex : 'none'

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
    e.stopPropagation()
    if (e.key === 'Enter') {
      this.validate()
      e.preventDefault()
      return
    }
    if (e.key === 'Escape') {
      this.stop()
      e.preventDefault()
    }
  }

  this.onKeyUp = (e) => {
    e.stopPropagation()
    this.update()
  }
}
