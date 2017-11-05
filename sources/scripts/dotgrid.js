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
  var cursor_end = null;

  var from = null;
  var to = null;
  var end = null;

  this.svg_el = null;

  this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  this.segments = [];
  this.interface = document.createElement("div");
  this.interface.id = "interface";

  this.install = function()
  {
    // Dotgrid
    this.element = document.createElement("div");
    this.element.id = "dotgrid";
    this.element.style.width = this.width;
    this.element.style.height = this.height;
    document.body.appendChild(this.element);
    document.body.appendChild(this.interface);

    // Markers
    for (var x = this.grid_x; x >= 0; x--) {
      for (var y = this.grid_y; y >= 0; y--) {
        var marker = document.createElement("div");
        marker.setAttribute("class",(x % this.block_x == 0 && y % this.block_y == 0 ? "marker block" : "marker"));
        marker.style.left = parseInt(x * this.grid_width + (this.grid_width/2)) +5;
        marker.style.top = parseInt(y * this.grid_height + (this.grid_height/2)) +5;
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

    cursor_end = document.createElement("div");
    cursor_end.id = "cursor_end";
    this.element.appendChild(cursor_end);

    // Vector
    this.svg_el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg_el.setAttribute("class","vector");
    this.svg_el.setAttribute("width",this.width+"px");
    this.svg_el.setAttribute("height",this.height+"px");
    this.svg_el.setAttribute("xmlns","http://www.w3.org/2000/svg");
    this.svg_el.setAttribute("baseProfile","full");
    this.svg_el.setAttribute("version","1.1");
    this.svg_el.style.width = this.width;
    this.svg_el.style.height = this.height;
    this.svg_el.style.stroke = this.color;
    this.svg_el.style.strokeWidth = this.thickness;
    this.svg_el.style.fill = "none";
    this.svg_el.style.strokeLinecap = this.linecap;
    this.element.appendChild(this.svg_el);

    this.svg_el.appendChild(this.path);   

    this.draw(); 
  }

  // Cursor

  this.mouse_down = function(e)
  {
    var o = e.target.getAttribute("data-operation");
    if(!o){ return; }

    console.log(o)
    if(o == "line"){ this.draw_line(); }
    if(o == "arc_c"){ this.draw_arc("0,1"); }
    if(o == "arc_r"){ this.draw_arc("0,0"); }
    if(o == "bezier"){ this.draw_bezier(); }
    if(o == "export"){ this.export(); }
  }

  this.mouse_move = function(e)
  {
    var pos = this.position_in_grid(e.clientX,e.clientY);
    pos = this.position_on_grid(pos[0],pos[1]);

    this.cursor.style.left = -pos[0] + 10;
    this.cursor.style.top = pos[1] + 10;
  }

  this.mouse_up = function(e)
  {
    var pos = this.position_in_grid(e.clientX,e.clientY);
    pos = this.position_on_grid(pos[0],pos[1]);

    pos = [pos[0],pos[1]]

    if(pos[1] > 300){ return; }
    if(pos[0] < -300){ return; }
    if(pos[0] > 0){ return; }
    if(pos[1] < 0){ return; }
    
    if(from === null){ this.set_from(pos); }
    else if(to === null){ this.set_to(pos); }
    else{ this.set_end(pos); }
    this.draw();
  }

  // Setters

  this.set_from = function(pos)
  {
    from = pos;

    cursor_from.style.left = -pos[0] + 10;
    cursor_from.style.top = pos[1] + 10;
  }

  this.set_to = function(pos)
  {
    cursor_to.style.left = -pos[0] + 10;
    cursor_to.style.top = pos[1] + 10;

    to = pos;
  }

  this.set_end = function(pos)
  {
    cursor_end.style.left = -pos[0] + 10;
    cursor_end.style.top = pos[1] + 10;

    end = pos;
  }

  this.mod_thickness = function(mod)
  {
    this.thickness += mod;
    this.draw();
  }

  this.mod_linecap_index = 1;

  this.mod_linecap = function(mod)
  {
    var a = ["butt","square","round"];
    this.mod_linecap_index += 1;
    this.linecap = a[this.mod_linecap_index % a.length];
    this.draw();
  }

  this.mod_move = function(x,y)
  {
    if(!to && !end){
      this.set_from([from[0]+(x*10),from[1]+(y*10)])
      this.draw();
      return;
    }
    if(!end){
      this.set_to([to[0]+(x*10),to[1]+(y*10)])
      this.draw();
      return;
    }
    this.set_end([end[0]+(x*10),end[1]+(y*10)])
    this.draw();
  }

  this.draw = function()
  {
    var d = "";
    var prev = "";
    for(id in this.segments){
      var segment = this.segments[id];
      d += segment.to_segment(prev)+" ";
      prev = segment;
    }

    this.path.setAttribute("d",d);

    this.svg_el.style.width = this.width;
    this.svg_el.style.height = this.height;
    this.svg_el.style.stroke = this.color;
    this.svg_el.style.strokeLinecap = this.linecap;
    this.svg_el.style.strokeWidth = this.thickness;

    this.update_interface();
  }

  // Draw
  this.draw_line = function()
  {
    if(from === null || to === null){ return; }

    var end_point = end ? new Pos(end[0] * -1,end[1]) : null;
    this.segments.push(new Path_Line(new Pos(from[0] * -1,from[1]),new Pos(to[0] * -1,to[1]),end_point));

    this.draw();
    reset();
  }

  this.draw_arc = function(orientation)
  {
    if(from === null || to === null){ return; }

    var end_point = end ? new Pos(end[0] * -1,end[1]) : null;
    this.segments.push(new Path_Arc(new Pos(from[0] * -1,from[1]),new Pos(to[0] * -1,to[1]),orientation,end_point));

    this.draw();
    reset();
  }

  this.draw_bezier = function()
  {
    if(from === null || to === null){ return; }  

    this.segments.push(new Path_Bezier(new Pos(from[0] * -1,from[1]),new Pos(to[0] * -1,to[1]),new Pos(end[0] * -1,end[1])));

    this.draw();
    reset();
  }

  this.draw_close = function()
  {
    if(this.segments.length == 0){ return; }

    this.segments.push(new Path_Close());
    
    this.draw();
    reset();
  }

  this.draw_dot = function()
  {
    var s = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    s.setAttribute("cx",-from[0]);
    s.setAttribute("cy",from[1]);
    s.setAttribute("r","2");
    s.setAttribute("fill","black");
    this.svg_el.appendChild(s);

    reset();
  }

  this.draw_circle = function()
  {
    if(from === null || to === null){ return; }

    var s = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    s.setAttribute("cx",-from[0]);
    s.setAttribute("cy",from[1]);
    s.setAttribute("r",(from[0] - to[0]));
    this.svg_el.appendChild(s);

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
    this.svg_el.appendChild(s);

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
    end = null;
    cursor_from.style.left = -100;
    cursor_from.style.top = -100;
    cursor_to.style.left = -100;
    cursor_to.style.top = -100;
    cursor_end.style.left = -100;
    cursor_end.style.top = -100;
  }

  this.erase = function()
  {
    this.reset();
    this.segments.pop();
    this.draw();
  }

  this.export = function()
  {
    if(this.segments.length == 0){ return; }
    
    dialog.showSaveDialog((fileName) => {
      if (fileName === undefined){ return; }
      fs.writeFile(fileName+".svg", dotgrid.svg_el.outerHTML, (err) => {
        if(err){ alert("An error ocurred creating the file "+ err.message); return; }
      });
    }); 
  }

  this.update_interface = function()
  {
    var html = "";

    if(from && to){
      html += "<img data-operation='line' title='line' src='media/icons/line.svg' class='icon'/>";
      html += "<img data-operation='arc_c' title='arc clockwise' src='media/icons/arc_clockwise.svg' class='icon'/>";
      html += "<img data-operation='arc_r' title='arc reverse' src='media/icons/arc_reverse.svg' class='icon'/>";
    }
    else{
      html += "<img title='line' src='media/icons/line.svg' class='icon inactive'/>";
      html += "<img title='arc clockwise' src='media/icons/arc_clockwise.svg' class='icon inactive'/>";
      html += "<img title='arc reverse' src='media/icons/arc_reverse.svg' class='icon inactive'/>";
    }

    if(from && to && end){
      html += "<img data-operation='bezier' title='bezier' src='media/icons/bezier.svg' class='icon'/>";  
    }
    else{
      html += "<img title='bezier' src='media/icons/bezier.svg' class='icon inactive'/>";
    }

    if(this.segments.length > 0){
      html += "<img data-operation='export' title='export' src='media/icons/export.svg' class='icon right'/>";
    }
    else{
      html += "<img title='export' src='media/icons/export.svg' class='icon right inactive'/>";
    }
    
    this.interface.innerHTML = html;
  }

  // Normalizers

  this.position_in_grid = function(x,y)
  {
    return [(window.innerWidth/2) - (this.width/2) - x,y - 50];
  }

  this.position_on_grid = function(x,y)
  {
    x = parseInt(x/this.grid_width) * this.grid_width - (this.grid_width/2) + 5;
    y = parseInt(y/this.grid_height) * this.grid_height + (this.grid_height/2) +5;
    return [parseInt(x),parseInt(y)];
  }
}