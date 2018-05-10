function Render()
{
  this.el = document.createElement("canvas"); this.el.id = "render";
  this.img = document.createElement("img");

  this.el.width = 1280; this.el.height = 1280;

  this.draw = function()
  {
    var xml = new XMLSerializer().serializeToString(dotgrid.svg_el);
    var svg64 = btoa(xml);
    var b64Start = 'data:image/svg+xml;base64,';
    var image64 = b64Start + svg64;
    this.img.src = image64;
    this.el.getContext('2d').clearRect(0, 0, 1280, 1280);
    this.el.getContext('2d').drawImage(this.img, 0, 0, 1280, 1280);
  }

  this.buffer = function()
  {
    var fs = require('fs');
    var data = this.el.toDataURL('image/png').replace(/^data:image\/\w+;base64,/, "");
    var buf = new Buffer(data, 'base64');

    return buf
  }

  this.to_svg = function()
  {
    /*
    var svg_el = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    this.svg_el.setAttribute("class","vector");
    this.svg_el.setAttribute("width",this.tool.settings.size.width+"px");
    this.svg_el.setAttribute("height",this.tool.settings.size.height+"px");
    this.svg_el.setAttribute("xmlns","http://www.w3.org/2000/svg");
    this.svg_el.setAttribute("baseProfile","full");
    this.svg_el.setAttribute("version","1.1");

  this.layer_1 = document.createElementNS("http://www.w3.org/2000/svg", "path"); this.layer_1.id = "layer_1"; this.layer_1.style.stroke = "black";
  this.layer_2 = document.createElementNS("http://www.w3.org/2000/svg", "path"); this.layer_2.id = "layer_2"; this.layer_2.style.stroke = "#999";
  this.layer_3 = document.createElementNS("http://www.w3.org/2000/svg", "path"); this.layer_3.id = "layer_3"; this.layer_3.style.stroke = "#ccc";
  
    this.svg_el.setAttribute("width",size.width+"px");
    this.svg_el.setAttribute("height",size.height+"px");

    this.svg_el.style.width = this.tool.settings.size.width;
    this.svg_el.style.height = this.tool.settings.size.height;
    this.svg_el.style.fill = "none";
    this.svg_el.style.strokeWidth = this.tool.style().thickness;

    this.svg_el.appendChild(this.layer_3);
    this.svg_el.appendChild(this.layer_2);
    this.svg_el.appendChild(this.layer_1);


    this.layer_1.style.strokeWidth = this.tool.styles[0].thickness;
    this.layer_1.style.strokeLinecap = this.tool.styles[0].strokeLinecap;
    this.layer_1.style.strokeLinejoin = this.tool.styles[0].strokeLinejoin;
    this.layer_1.style.stroke = this.tool.styles[0].color;
    this.layer_1.style.fill = this.tool.styles[0].fill;
  
    this.layer_2.style.strokeWidth = this.tool.styles[1].thickness;
    this.layer_2.style.strokeLinecap = this.tool.styles[1].strokeLinecap;
    this.layer_2.style.strokeLinejoin = this.tool.styles[1].strokeLinejoin;
    this.layer_2.style.stroke = this.tool.styles[1].color;
    this.layer_2.style.fill = this.tool.styles[1].fill;
    
    this.layer_3.style.strokeWidth = this.tool.styles[2].thickness;
    this.layer_3.style.strokeLinecap = this.tool.styles[2].strokeLinecap;
    this.layer_3.style.strokeLinejoin = this.tool.styles[2].strokeLinejoin;
    this.layer_3.style.stroke = this.tool.styles[2].color;
    this.layer_3.style.fill = this.tool.styles[2].fill;

    return svg_el.outerHTML;
    */
    return "22"
  }
}