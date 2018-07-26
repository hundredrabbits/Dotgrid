function Picker()
{
  this.memory = "";
  this.el = document.createElement("input");
  this.el.id = "picker"
  this.original = null;

  this.start = function()
  {
    this.el.setAttribute("placeholder",`${dotgrid.tool.style().color}`)

    dotgrid.controller.set("picker");
    dotgrid.interface.el.className = "picker"
    this.el.focus()
    this.original = dotgrid.tool.style().color
    this.el.value = ""
  }

  this.stop = function()
  {
    this.cancel();
    dotgrid.controller.set();
    dotgrid.interface.el.className = ""
    this.el.blur()
    this.el.value = ""
  }

  this.validate = function()
  {
    var parts = this.parse(this.el.value)

    if(parts.color){ this.set_color(parts.color); }
    if(parts.size){ this.set_size(parts.size); }

    dotgrid.guide.refresh();
    dotgrid.controller.set();
    dotgrid.interface.el.className = ""
    this.el.blur()
    this.el.value = ""

    setTimeout(() => { dotgrid.interface.refresh(true); }, 500)
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
    dotgrid.guide.refresh();
  }

  this.update = function()
  {
    var parts = this.parse(this.el.value)
    if(!parts.color){ return; }

    dotgrid.tool.style().color = parts.color;
    dotgrid.tool.style().fill = dotgrid.tool.style().fill != "none" ? parts.color : "none";
    dotgrid.guide.refresh();
  }

  this.listen = function(e)
  {
    if(e.key == "Enter"){
      this.validate();
      e.preventDefault();
      return;
    }

    this.update();
  }

  this.parse = function(value)
  {
    var parts = value.split(" ");
    var color = null;
    var size = null;

    for(id in parts){
      var part = parts[id];
      if(is_color(part) && !color){ color = part; }
      if(is_size(part) && !size){ size = { width:parseInt(part.toLowerCase().split("x")[0]),height:parseInt(part.toLowerCase().split("x")[1]) }; }
    }
    return {color:color,size:size}
  }

  function is_size(val)
  {
    if(val.toLowerCase().indexOf("x") < 1){ return false; }

    return true
  }

  function is_color(val)
  {
    if(val.length != 4 && val.length != 7){
      return false
    }

    var re = /\#[0-9A-Fa-f]/g;
    return re.test(val)
  }

  this.el.onkeyup = function(event){ dotgrid.picker.listen(event); };
}