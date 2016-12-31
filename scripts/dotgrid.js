function Dotgrid(width,height,grid_x,grid_y)
{
  this.width = width;
  this.height = height;
  this.grid_x = grid_x;
  this.grid_y = grid_y;
  this.element = null;

  this.grid_width = this.width/this.grid_x;
  this.grid_height = this.height/this.grid_y;

  this.cursor = null;
  this.cursor_from = null;
  this.cursor_to = null;

  this.button_line = null;
  this.button_arc_c = null;
  this.button_arc_a = null;

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
        marker.setAttribute("class","marker");
        marker.style.left = x * this.grid_width + (this.grid_width/2);
        marker.style.top = y * this.grid_height + (this.grid_height/2);
        this.element.appendChild(marker);
      }
    }

    // Cursors
    this.cursor = document.createElement("div");
    this.cursor.id = "cursor";
    this.element.appendChild(this.cursor);

    this.cursor_from = document.createElement("div");
    this.cursor_from.id = "cursor_from";
    this.element.appendChild(this.cursor_from);

    this.cursor_to = document.createElement("div");
    this.cursor_to.id = "cursor_to";
    this.element.appendChild(this.cursor_to);

    // Vector
    vector_element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    vector_element.setAttribute("class","vector");
    vector_element.setAttribute("width",this.width+"px");
    vector_element.setAttribute("height",this.height+"px");
    vector_element.style.width = this.width;
    vector_element.style.height = this.height;
    this.element.appendChild(vector_element);

    // Options
    this.button_line = document.getElementById("line")

    this.button_arc_c = document.getElementById("arc_c")

    this.button_arc_a = document.getElementById("arc_a")

    if (this.button_line.addEventListener){ 
      this.button_line.addEventListener("click", draw_line, false); }
    else if (this.button_line.attachEvent){
      this.button_line.attachEvent('onclick', draw_line);  
    }

    if (this.button_arc_c.addEventListener){ 
      this.button_arc_c.addEventListener("click", draw_arc_c, false); }
    else if (this.button_arc_c.attachEvent){
      this.button_arc_c.attachEvent('onclick', draw_arc_c);  
    }

    if (this.button_arc_a.addEventListener){ 
      this.button_arc_a.addEventListener("click", this.draw_arc_a, false); }
    else if (this.button_arc_a.attachEvent){
      this.button_arc_a.attachEvent('onclick', this.draw_arc_a);  
    }
  }

  // Cursor


  this.mouse_down = function(e)
  {
    var pos = this.position_in_grid(e.clientX,e.clientY);
    pos = this.position_on_grid(pos[0],pos[1]);
    
    if(from === null){ this.set_from(pos); }
    else if(to === null){ this.set_to(pos); }
    else{  }
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
    
  }

  // Setters

  this.set_from = function(pos)
  {
    from = pos;

    this.cursor_from.style.left = -pos[0];
    this.cursor_from.style.top = pos[1];
  }

  this.set_to = function(pos)
  {
    this.cursor_to.style.left = -pos[0];
    this.cursor_to.style.top = pos[1];

    to = pos;
  }

  // Draw


  function draw_line()
  {
    console.log("from: "+from); console.log("to: "+to);
    var aLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    aLine.setAttribute('x1', -from[0]);
    aLine.setAttribute('y1', from[1]);
    aLine.setAttribute('x2', -to[0]);
    aLine.setAttribute('y2', to[1]);
    aLine.setAttribute('stroke', "#000000");
    aLine.setAttribute('stroke-width', "5");

    vector_element.appendChild(aLine);

    reset();
  }

  draw_arc_c = function()
  {
    var s = document.createElementNS("http://www.w3.org/2000/svg", "path");
    s.setAttribute("d","M"+(-from[0])+","+(from[1])+" A15,15 0 0,1 "+(-to[0])+","+(to[1])+"");
    s.setAttribute('stroke', "#000000");
    s.setAttribute('stroke-width', "5");
    s.setAttribute('fill', "none");
    vector_element.appendChild(s);

    reset();
  }

  this.draw_arc_a = function()
  {
    
  }

  function reset()
  {
    from = null;
    to = null;
    this.cursor_from.style.left = -100;
    this.cursor_from.style.top = -100;
    this.cursor_to.style.left = -100;
    this.cursor_to.style.top = -100;

  }

  // Normalizers

  this.position_in_grid = function(x,y)
  {
    return [(window.innerWidth/2) - (this.width/2) - x,y - 50];
  }

  this.position_on_grid = function(x,y)
  {
    x = parseInt(x/this.grid_width) * this.grid_width - (this.grid_width/2);
    y = parseInt(y/this.grid_height) * this.grid_height - (this.grid_height/2);
    return [x,y];
  }
}