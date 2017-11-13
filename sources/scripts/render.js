function Render()
{
  this.el = document.createElement("canvas"); this.el.id = "render";
  this.img = document.createElement("img");

  this.el.width = 512; this.el.height = 512;

  this.draw = function()
  {
    var xml = new XMLSerializer().serializeToString(dotgrid.svg_el);
    var svg64 = btoa(xml);
    var b64Start = 'data:image/svg+xml;base64,';
    var image64 = b64Start + svg64;
    this.img.src = image64;
    this.el.getContext('2d').clearRect(0, 0, 1280, 1280);
    this.el.getContext('2d').drawImage(this.img, 0, 0, 512, 512);
  }

  this.buffer = function()
  {
    var fs = require('fs');
    var data = this.el.toDataURL('image/png').replace(/^data:image\/\w+;base64,/, "");
    var buf = new Buffer(data, 'base64');

    return buf
  }
}