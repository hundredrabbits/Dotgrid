'use strict';

function Picker()
{
  this.memory = "";
  this.el = document.createElement("div");
  this.el.id = "picker"
  this.input = document.createElement("input");
  this.input.id = "picker_input"
  this.original = null;

  this.el.appendChild(this.input)

  this.start = function()
  {
    this.input.setAttribute("placeholder",`${dotgrid.tool.style().color.replace("#","").trim()}`)
    this.input.setAttribute("maxlength",6)

    try{ dotgrid.controller.set("picker"); }
    catch(err){ }

    dotgrid.interface.el.className = "picker"
    this.input.focus()
    this.original = dotgrid.tool.style().color
    this.input.value = ""
  }

  this.stop = function()
  {
    this.cancel();

    try{ dotgrid.controller.set(); }
    catch(err){ console.log("No controller"); }

    dotgrid.interface.el.className = ""
    this.input.blur()
    this.input.value = ""
  }

  this.validate = function()
  {
    if(!is_color(this.input.value)){ return; }

    let hex = `#${this.input.value}`;

    this.set_color(hex);

    dotgrid.guide.update();
    
    try{ dotgrid.controller.set(); }
    catch(err){ console.log("No controller"); }

    dotgrid.interface.el.className = ""
    this.input.blur()
    this.input.value = ""

    setTimeout(() => { dotgrid.interface.update(true); }, 250)
  }

  this.set_color = function(color)
  {
    dotgrid.tool.style().color = color;
    dotgrid.tool.style().fill = dotgrid.tool.style().fill != "none" ? color : "none";
  }

  this.set_size = function(size)
  {
    dotgrid.set_size(size);
  }

  this.cancel = function()
  {
    if(!this.original){ return; }
    dotgrid.tool.style().color = this.original;
    dotgrid.tool.style().fill = dotgrid.tool.style().fill != "none" ? this.original : "none";
    dotgrid.guide.update();
  }

  this.update = function()
  {
    if(!is_color(this.input.value)){ return; }

    let hex = `#${this.input.value}`;

    dotgrid.tool.style().color = hex;
    dotgrid.tool.style().fill = dotgrid.tool.style().fill != "none" ? hex : "none";
    dotgrid.guide.update();
    dotgrid.interface.update(true);
  }

  this.listen = function(e)
  {
    if(e.key == "Enter"){
      this.validate();
      e.preventDefault();
      return;
    }

    if(e.key == "Escape"){
      this.stop();
      e.preventDefault();
      return;
    }

    this.update();
  }

  function is_color(val)
  {
    if(val.length != 3 && val.length != 6){
      return false
    }

    let re = /[0-9A-Fa-f]/g;
    return re.test(val)
  }

  this.input.onkeyup = function(event){ dotgrid.picker.listen(event); };
}