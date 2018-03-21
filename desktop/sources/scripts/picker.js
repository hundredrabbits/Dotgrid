function Picker()
{
  this.memory = "";
  this.el = document.createElement("input");
  this.el.id = "picker"
  this.el.setAttribute("placeholder","#ff0000")
  this.el.setAttribute("maxlength","7")
  this.original = null;

  this.start = function()
  {
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
    if(!is_valid(this.el.value)){ return; }

    dotgrid.tool.style().color = this.el.value;
    dotgrid.tool.style().fill = dotgrid.tool.style().fill != "none" ? this.el.value : "none";
    dotgrid.draw();
    dotgrid.controller.set();
    dotgrid.interface.el.className = ""
    this.el.blur()
  }

  this.cancel = function()
  {
    if(!this.original){ return; }
    dotgrid.tool.style().color = this.original;
    dotgrid.tool.style().fill = dotgrid.tool.style().fill != "none" ? this.original : "none";
    dotgrid.draw();
  }

  this.update = function()
  {
    if(this.el.value.length != 4 && this.el.value.length != 7){ return; }

    dotgrid.tool.style().color = this.el.value;
    dotgrid.tool.style().fill = dotgrid.tool.style().fill != "none" ? this.el.value : "none";
    dotgrid.draw();
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

  function is_valid(val)
  {
    var re = /[0-9A-Fa-f]{6}/g;
    return re.test(val)
  }

  this.el.onkeyup = function(event){ dotgrid.picker.listen(event); };
}