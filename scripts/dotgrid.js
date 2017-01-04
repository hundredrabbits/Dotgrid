function Dotgrid(width,height,grid_x,grid_y,block_x,block_y,thickness = 3,linecap = "round", color = "#000000")
{
  this.width = width;
  this.height = height;
  this.grid_x = grid_x;
  this.grid_y = grid_y;
  this.block_x = block_x;
  this.block_y = block_y;

  this.thickness = thickness;
  this.linecap = linecap;
  this.color = color;

  this.element = null;

  this.grid_width = this.width/this.grid_x;
  this.grid_height = this.height/this.grid_y;

  var cursor = null;
  var cursor_from = null;
  var cursor_to = null;

  var from = null;
  var to = null;
  var vector_element = null;

  this.install = function()
  {
    // Dotgrid
    this.element = document.createElement("div");
    this.element.id = "dotgrid";
    this.element.style.width = this.width;
    this.element.style.height = this.height;
    document.body.appendChild(this.element);

    // Markers
    for (var x = this.grid_x - 1; x >= 0; x--) {
      for (var y = this.grid_y - 1; y >= 0; y--) {
        var marker = document.createElement("div");
        marker.setAttribute("class",(x % this.block_x == 0 && y % this.block_y == 0 ? "marker block" : "marker"));
        marker.style.left = parseInt(x * this.grid_width + (this.grid_width/2));
        marker.style.top = parseInt(y * this.grid_height + (this.grid_height/2));
        this.element.appendChild(marker);
      }
    }

    // Cursors
    this.cursor = document.createElement("div");
    this.cursor.id = "cursor";
    this.element.appendChild(this.cursor);

    cursor_from = document.createElement("div");
    cursor_from.id = "cursor_from";
    this.element.appendChild(cursor_from);

    cursor_to = document.createElement("div");
    cursor_to.id = "cursor_to";
    this.element.appendChild(cursor_to);

    // Vector
    vector_element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    vector_element.setAttribute("class","vector");
    vector_element.setAttribute("width",this.width+"px");
    vector_element.setAttribute("height",this.height+"px");
    vector_element.setAttribute("xmlns","http://www.w3.org/2000/svg");
    vector_element.setAttribute("baseProfile","full");
    vector_element.setAttribute("version","1.1");
    vector_element.style.width = this.width;
    vector_element.style.height = this.height;
    vector_element.style.stroke = this.color;
    vector_element.style.strokeWidth = this.thickness;
    vector_element.style.fill = "none";
    vector_element.style.strokeLinecap = this.linecap;
    this.element.appendChild(vector_element);
  }

  // Cursor


  this.mouse_down = function(e)
  {
  }

  this.mouse_move = function(e)
  {
    var pos = this.position_in_grid(e.clientX,e.clientY);
    pos = this.position_on_grid(pos[0],pos[1]);

    this.cursor.style.left = -pos[0];
    this.cursor.style.top = pos[1];
  }

  this.mouse_up = function(e)
  {
    var pos = this.position_in_grid(e.clientX,e.clientY);
    pos = this.position_on_grid(pos[0],pos[1]);
    
    if(from === null){ this.set_from(pos); }
    else if(to === null){ this.set_to(pos); }
    else{  }
    
  }

  // Setters

  this.set_from = function(pos)
  {
    from = pos;

    cursor_from.style.left = -pos[0];
    cursor_from.style.top = pos[1];
  }

  this.set_to = function(pos)
  {
    cursor_to.style.left = -pos[0];
    cursor_to.style.top = pos[1];

    to = pos;
  }

  // Draw
  this.draw_line = function()
  {
    if(from === null || to === null){ return; }

    var s = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    s.setAttribute('x1', -from[0]);
    s.setAttribute('y1', from[1]);
    s.setAttribute('x2', -to[0]);
    s.setAttribute('y2', to[1]);

    vector_element.appendChild(s);

    reset();
  }

  this.draw_arc = function(orientation)
  {
    if(from === null || to === null){ return; }

    var s = document.createElementNS("http://www.w3.org/2000/svg", "path");
    s.setAttribute("d","M"+(-from[0])+","+(from[1])+" A"+(to[0] - from[0])+","+(to[1] - from[1])+" 0 "+orientation+" "+(-to[0])+","+(to[1])+"");
    vector_element.appendChild(s);

    reset();
  }

  this.draw_dot = function()
  {
    var s = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    s.setAttribute("cx",-from[0]);
    s.setAttribute("cy",from[1]);
    s.setAttribute("r","2");
    s.setAttribute("fill","black");
    vector_element.appendChild(s);

    reset();
  }

  this.draw_circle = function()
  {
    if(from === null || to === null){ return; }

    var s = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    s.setAttribute("cx",-from[0]);
    s.setAttribute("cy",from[1]);
    s.setAttribute("r",(from[0] - to[0]));
    vector_element.appendChild(s);

    reset();
  }

  this.draw_rect = function()
  {
    if(from === null || to === null){ return; }

    var s = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    s.setAttribute("x",-from[0]);
    s.setAttribute("y",from[1]);
    s.setAttribute("width",Math.abs(to[0]) - Math.abs(from[0]));
    s.setAttribute("height",Math.abs(to[1]) - Math.abs(from[1]));
    vector_element.appendChild(s);

    reset();
  }

  this.reset = function()
  {
    reset();
  }

  function reset()
  {
    from = null;
    to = null;
    cursor_from.style.left = -100;
    cursor_from.style.top = -100;
    cursor_to.style.left = -100;
    cursor_to.style.top = -100;
  }

  this.erase = function()
  {
    this.reset();
    if(vector_element.lastChild === null){ return; }
    vector_element.removeChild(vector_element.lastChild);
  }

  this.export = function()
  {
    var w = window.open('about:blank');
    w.document.write("<title>Export</title>");
    w.document.body.innerText += vector_element.outerHTML;
  }

  // Normalizers

  this.position_in_grid = function(x,y)
  {
    return [(window.innerWidth/2) - (this.width/2) - x,y - 50];
  }

  this.position_on_grid = function(x,y)
  {
    x = parseInt(x/this.grid_width) * this.grid_width - (this.grid_width/2);
    y = parseInt(y/this.grid_height) * this.grid_height + (this.grid_height/2);
    return [parseInt(x),parseInt(y)];
  }
}