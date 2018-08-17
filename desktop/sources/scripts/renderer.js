function Renderer()
{
  // Create SVG parts
  this.svg_el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  this.svg_el.setAttribute("xmlns","http://www.w3.org/2000/svg");
  this.svg_el.setAttribute("baseProfile","full");
  this.svg_el.setAttribute("version","1.1");
  this.svg_el.style.fill = "none";

  this.layer_1 = document.createElementNS("http://www.w3.org/2000/svg", "path"); 
  this.layer_2 = document.createElementNS("http://www.w3.org/2000/svg", "path"); 
  this.layer_3 = document.createElementNS("http://www.w3.org/2000/svg", "path"); 

  this.svg_el.appendChild(this.layer_3);
  this.svg_el.appendChild(this.layer_2);
  this.svg_el.appendChild(this.layer_1);

  this.refresh = function()
  {
    this.svg_el.setAttribute("width",(dotgrid.tool.settings.size.width-(5))+"px");
    this.svg_el.setAttribute("height",(dotgrid.tool.settings.size.height+(10))+"px");
    this.svg_el.style.width = (dotgrid.tool.settings.size.width-(5));
    this.svg_el.style.height = dotgrid.tool.settings.size.height+(10);
    this.svg_el.style.strokeWidth = dotgrid.tool.style().thickness;

    var styles = dotgrid.tool.styles
    var paths = dotgrid.tool.paths()

    this.layer_1.style.strokeWidth = styles[0].thickness;
    this.layer_1.style.strokeLinecap = styles[0].strokeLinecap;
    this.layer_1.style.strokeLinejoin = styles[0].strokeLinejoin;
    this.layer_1.style.stroke = styles[0].color;
    this.layer_1.style.fill = styles[0].fill;
    this.layer_1.setAttribute("d",paths[0])
  
    this.layer_2.style.strokeWidth = styles[1].thickness;
    this.layer_2.style.strokeLinecap = styles[1].strokeLinecap;
    this.layer_2.style.strokeLinejoin = styles[1].strokeLinejoin;
    this.layer_2.style.stroke = styles[1].color;
    this.layer_2.style.fill = styles[1].fill;
    this.layer_2.setAttribute("d",paths[1])
    
    this.layer_3.style.strokeWidth = styles[2].thickness;
    this.layer_3.style.strokeLinecap = styles[2].strokeLinecap;
    this.layer_3.style.strokeLinejoin = styles[2].strokeLinejoin;
    this.layer_3.style.stroke = styles[2].color;
    this.layer_3.style.fill = styles[2].fill; 
    this.layer_3.setAttribute("d",paths[2])   
  }

  this.to_png = function(size = dotgrid.tool.settings.size,callback = dotgrid.render)
  {
    if(!dialog){ return this.to_png_web(size); }

    this.refresh();

    var xml = new XMLSerializer().serializeToString(this.svg_el);
    var svg64 = btoa(xml);
    var b64Start = 'data:image/svg+xml;base64,';
    var image64 = b64Start + svg64;
    var img = new Image;

    var canvas = document.createElement("canvas");

    canvas.width = (size.width)*2; 
    canvas.height = (size.height+30)*2;

    var ctx = canvas.getContext('2d');

    img.onload = function(){
      ctx.drawImage(img, 0, 0, (size.width)*2, (size.height+30)*2);
      var data = canvas.toDataURL('image/png').replace(/^data:image\/\w+;base64,/, "");
      dotgrid.renderer.to_png_ready(callback, new Buffer(data, 'base64'),size)
    };
    img.src = image64;
  }

  this.to_png_ready = function(callback, buffer, size)
  {
    callback(null,buffer,size)
  }

  this.to_png_web = function(size)
  {
    console.log('Making!');

    this.refresh();

    var xml = new XMLSerializer().serializeToString(this.svg_el);
    var svg64 = btoa(xml);
    var b64Start = 'data:image/svg+xml;base64,';
    var image64 = b64Start + svg64;

    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext('2d');
    
    var win = window.open('about:blank','image from canvas');
    var img = new Image;

    canvas.width = size.width*2; 
    canvas.height = size.height*2;

    img.onload = function(){
      ctx.drawImage(img, 0, 0, size.width*2, size.height*2);
      win.document.write(`<img width='${size.width/2}' height='${size.height/2}' src='${canvas.toDataURL("image/png")}' alt='from canvas'/>`);
    };
    img.src = image64;
  }

  this.to_svg = function()
  {
    this.refresh();

    return this.svg_el.outerHTML;
  }
}