function Dotgrid(width,height,grid_x,grid_y,block_x,block_y,thickness = 3,linecap = "round", color = "#000000")
{
  this.theme = new Theme();

  this.width = width;
  this.height = height;
  this.grid_x = grid_x;
  this.grid_y = grid_y;
  this.block_x = block_x;
  this.block_y = block_y;

  this.thickness = thickness;
  this.linecap = linecap;
  this.color = color;
  this.offset = new Pos(0,0);

  // Dotgrid
  this.element = document.createElement("div");
  this.element.id = "dotgrid";
  this.element.style.width = this.width;
  this.element.style.height = this.height;

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
  this.mirror_el = null;

  this.mirror = false;
  this.fill = false;

  this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  this.segments = [];
  this.interface = document.createElement("div");
  this.interface.id = "interface";

  this.install = function()
  {
    document.body.appendChild(this.element);
    document.body.appendChild(this.interface);

    // Markers
    for (var x = this.grid_x; x >= 0; x--) {
      for (var y = this.grid_y; y >= 0; y--) {
        var marker = document.createElement("div");
        marker.setAttribute("class",(x % this.block_x == 0 && y % this.block_y == 0 ? "marker bm" : "marker bl"));
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

    this.offset_el = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.mirror_el = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.mirror_path = document.createElementNS("http://www.w3.org/2000/svg", "path");

    // Vector
    this.svg_el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg_el.setAttribute("class","vector fh");
    this.svg_el.setAttribute("width",this.width+"px");
    this.svg_el.setAttribute("height",this.height+"px");
    this.svg_el.setAttribute("xmlns","http://www.w3.org/2000/svg");
    this.svg_el.setAttribute("baseProfile","full");
    this.svg_el.setAttribute("version","1.1");
    this.svg_el.style.width = this.width;
    this.svg_el.style.height = this.height;
    this.svg_el.style.stroke = this.color;
    this.svg_el.style.strokeWidth = this.thickness;
    this.svg_el.style.fill = this.fill ? "black" : "none !important";
    this.svg_el.style.strokeLinecap = this.linecap;
    this.element.appendChild(this.svg_el);

    this.offset_el.appendChild(this.path)
    this.svg_el.appendChild(this.offset_el);
    this.svg_el.appendChild(this.mirror_el);
    this.mirror_el.appendChild(this.mirror_path);

    this.draw();

    this.theme.start();
  }

  // Cursor

  this.mouse_down = function(e)
  {
    var o = e.target.getAttribute("data-operation");
    if(!o){ return; }

    if(o == "line"){ this.draw_line(); }
    if(o == "arc_c"){ this.draw_arc("0,1"); }
    if(o == "arc_r"){ this.draw_arc("0,0"); }
    if(o == "bezier"){ this.draw_bezier(); }
    if(o == "close"){ this.draw_close(); }
    if(o == "mirror"){ this.mirror = this.mirror == true ? false : true; this.draw(); }
    if(o == "export"){ this.export(); }
  }

  this.mouse_move = function(e)
  {
    var pos = this.position_in_grid(new Pos(e.clientX,e.clientY));
    pos = this.position_on_grid(pos);

    this.cursor.style.left = -pos.x + 10;
    this.cursor.style.top = pos.y + 10;
  }

  this.mouse_up = function(e)
  {
    var pos = this.position_in_grid(new Pos(e.clientX,e.clientY));
    pos = this.position_on_grid(pos);

    if(pos.x>0) return;

    if(from === null){ this.set_from(pos); }
    else if(to === null){ this.set_to(pos); }
    else{ this.set_end(pos); }
    this.draw();
  }

  // Setters

  this.set_from = function(pos)
  {
    from = pos;

    cursor_from.style.left = -pos.x + 10;
    cursor_from.style.top = pos.y + 10;
  }

  this.set_to = function(pos)
  {
    cursor_to.style.left = -pos.x + 10;
    cursor_to.style.top = pos.y + 10;

    to = pos;
  }

  this.set_end = function(pos)
  {
    cursor_end.style.left = -pos.x + 10;
    cursor_end.style.top = pos.y + 10;

    end = pos;
  }

  this.mod_thickness = function(mod)
  {
    this.thickness = Math.max(this.thickness+mod,0);
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

  this.mod_move = function(move)
  {
    if(!to && !end && from){
      this.set_from(new Pos(from.x-(move.x),from.y+(move.y)))
      this.draw();
      return;
    }
    if(!end && to){
      this.set_to(new Pos(to.x-(move.x),to.y+(move.y)))
      this.draw();
      return;
    }
    if(end){
      this.set_end(new Pos(end.x-(move.x),end.y+(move.y)))
      this.draw();
      return;
    }
    // Move offset
    this.offset = this.offset.add(new Pos(move.x,move.y));
    this.draw();
  }

  this.toggle_fill = function()
  {
    dotgrid.fill = dotgrid.fill ? false : true;
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
    this.svg_el.style.fill = this.fill ? "black" : "none";

    this.mirror_path.setAttribute("d",this.mirror ? d : '');
    this.mirror_path.setAttribute("transform","translate("+(300 - (this.offset.x))+","+(this.offset.y)+"),scale(-1,1)")

    this.offset_el.setAttribute("transform","translate("+(this.offset.x)+","+(this.offset.y)+")")

    this.update_interface();
  }

  // Draw
  this.draw_line = function()
  {
    if(from === null || to === null){ return; }

    to = new Pos(to.x * -1, to.y).sub(this.offset)
    from = new Pos(from.x * -1,from.y).sub(this.offset)
    end = end ? new Pos(end.x * -1,end.y).sub(this.offset) : null;

    this.segments.push(new Path_Line(from,to,end));

    this.draw();
    reset();
  }

  this.draw_arc = function(orientation)
  {
    if(from === null || to === null){ return; }

    to = new Pos(to.x * -1, to.y).sub(this.offset)
    from = new Pos(from.x * -1,from.y).sub(this.offset)
    end = end ? new Pos(end.x * -1,end.y).sub(this.offset) : null;

    this.segments.push(new Path_Arc(from,to,orientation,end));

    this.draw();
    reset();
  }

  this.draw_bezier = function()
  {
    if(from === null || to === null || end === null){ return; }

    to = new Pos(to.x * -1, to.y).sub(this.offset)
    from = new Pos(from.x * -1,from.y).sub(this.offset)
    end = new Pos(end.x * -1,end.y).sub(this.offset)

    this.segments.push(new Path_Bezier(from,to,end));

    this.draw();
    reset();
  }

  this.draw_close = function()
  {
    if(this.segments.length == 0){ return; }
    if(this.segments[this.segments.length-1].name == "close"){ return; }

    this.segments.push(new Path_Close());

    this.draw();
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
    if(from || to || end){
      this.reset();
    }
    else{
      this.segments.pop();
    }
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
      html += "<img data-operation='line' title='line (d)' src='media/icons/line.svg' class='icon'/>";
      html += "<img data-operation='arc_c' title='arc clockwise (s)' src='media/icons/arc_clockwise.svg' class='icon'/>";
      html += "<img data-operation='arc_r' title='arc reverse (a)' src='media/icons/arc_reverse.svg' class='icon'/>";
    }
    else{
      html += "<img title='line (d)' src='media/icons/line.svg' class='icon inactive'/>";
      html += "<img title='arc clockwise (s)' src='media/icons/arc_clockwise.svg' class='icon inactive'/>";
      html += "<img title='arc reverse (a)' src='media/icons/arc_reverse.svg' class='icon inactive'/>";
    }

    if(from && to && end){
      html += "<img data-operation='bezier' title='bezier (f)' src='media/icons/bezier.svg' class='icon'/>";
    }
    else{
      html += "<img title='bezier (f)' src='media/icons/bezier.svg' class='icon inactive'/>";
    }

    if(this.segments.length > 0 && this.segments[this.segments.length-1].name != "close"){
      html += "<img data-operation='close (r)' title='close' src='media/icons/close.svg' class='icon'/>";
    }
    else{
      html += "<img title='close (r)' src='media/icons/close.svg' class='icon inactive'/>";
    }

    if(this.segments.length > 0 && !this.mirror){
      html += "<img data-operation='mirror' title='mirror (space)' src='media/icons/mirror.svg' class='icon' style='margin-left:35px'/>";
    }
    else{
      html += "<img data-operation='mirror' title='mirror (space)' src='media/icons/mirror.svg' class='icon inactive' style='margin-left:35px'/>";
    }

    if(this.segments.length > 0){
      html += "<img data-operation='export' title='export (e)' src='media/icons/export.svg' class='icon right'/>";
    }
    else{
      html += "<img title='export (e)' src='media/icons/export.svg' class='icon right inactive'/>";
    }

    this.interface.innerHTML = html;
  }

  // Normalizers

  this.position_in_grid = function(pos)
  {
    return new Pos((window.innerWidth/2) - (this.width/2) - pos.x,pos.y - 50)
  }

  this.position_on_grid = function(pos) // rounds the mouse position to the nearest cell, and limits the coords to within the box
  {
    x = Math.round(pos.x/this.grid_width)*this.grid_width
    y = Math.round(pos.y/this.grid_height)*this.grid_height+this.grid_height
    off = (x<-this.width || x>0 || y>this.height || y<0)
    if(off) { // change position so the cursor will not be seen
      x = 50
      y = -50
    }
    return new Pos(x,y);
  }
    
}

window.addEventListener('dragover',function(e)
{
  e.preventDefault();
  e.stopPropagation();
  e.dataTransfer.dropEffect = 'copy';
});

window.addEventListener('drop', function(e)
{
  e.preventDefault();
  e.stopPropagation();

  var files = e.dataTransfer.files;

  for(file_id in files){
    var file = files[file_id];
    if(file.name.indexOf(".thm") == -1){ console.log("skipped",file); continue; }

    var path = file.path;
    var reader = new FileReader();
    reader.onload = function(e){
      var o = JSON.parse(e.target.result);
      dotgrid.theme.install(o);
    };
    reader.readAsText(file);
    return;
  }
});
