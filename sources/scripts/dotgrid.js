function Dotgrid(width,height,grid_x,grid_y,block_x,block_y,thickness = 3,linecap = "round", color = "#000000")
{
  this.controller = new Controller();
  this.theme = new Theme();
  this.interface = new Interface();

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

  this.wrapper = document.createElement("div");
  this.wrapper.id = "wrapper";

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

  this.guide = new Guide();
  this.render = new Render();
  this.serializer = new Serializer();

  this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  this.segments = [];
  this.scale = 1

  this.install = function()
  {  
    document.getElementById("app").appendChild(this.wrapper);
    this.wrapper.appendChild(this.element);
    this.element.appendChild(this.guide.el);
    this.element.appendChild(this.guide.widgets);
    this.wrapper.appendChild(this.render.el);

    // Cursors
    this.cursor = document.createElement("div");
    this.cursor.id = "cursor";
    this.element.appendChild(this.cursor);

    this.cursor_coord = document.createElement("div");
    this.cursor_coord.id = "cursor_coord";
    this.cursor_coord.className = "fl"
    this.cursor.appendChild(this.cursor_coord);

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
    // Preview
    this.preview_el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.preview_el.id = "preview"
    this.preview_el.setAttribute("class","vector");
    this.preview_el.setAttribute("width",this.width+"px");
    this.preview_el.setAttribute("height",this.height+"px");
    this.preview_el.setAttribute("xmlns","http://www.w3.org/2000/svg");
    this.preview_el.setAttribute("baseProfile","full");
    this.preview_el.setAttribute("version","1.1");
    this.preview_el.style.width = this.width;
    this.preview_el.style.height = this.height;
    this.preview_el.style.stroke = "#72dec2";
    this.preview_el.style.strokeWidth = 2;
    this.preview_el.style.fill = "none";
    this.preview_el.style.strokeLinecap = "round";
    this.element.appendChild(this.preview_el);

    this.offset_el.appendChild(this.path)
    this.svg_el.appendChild(this.offset_el);
    this.svg_el.appendChild(this.mirror_el);
    this.mirror_el.appendChild(this.mirror_path);

    this.theme.start();
    this.guide.start();
    this.interface.start();

    this.controller.add("default","*","About",() => { require('electron').shell.openExternal('https://github.com/hundredrabbits/Dotgrid'); },"CmdOrCtrl+,");
    this.controller.add("default","*","Fullscreen",() => { app.toggle_fullscreen(); },"CmdOrCtrl+Enter");
    this.controller.add("default","*","Hide",() => { app.toggle_visible(); },"CmdOrCtrl+H");
    this.controller.add("default","*","Inspect",() => { app.inspect(); },"CmdOrCtrl+.");
    this.controller.add("default","*","Documentation",() => { dotgrid.controller.docs(); },"CmdOrCtrl+Esc");
    this.controller.add("default","*","Reset",() => { dotgrid.reset(); dotgrid.theme.reset(); },"CmdOrCtrl+Backspace");
    this.controller.add("default","*","Quit",() => { app.exit(); },"CmdOrCtrl+Q");

    this.controller.add("default","File","New",() => { dotgrid.new(); },"CmdOrCtrl+N");
    this.controller.add("default","File","Open",() => { dotgrid.open(); },"CmdOrCtrl+O");
    this.controller.add("default","File","Save",() => { dotgrid.save(); },"CmdOrCtrl+S");

    this.controller.add("default","Edit","Vertex",() => { dotgrid.add_point(); },"Enter");
    this.controller.add("default","Edit","Undo",() => { dotgrid.undo(); },"CmdOrCtrl+Z");
    this.controller.add("default","Edit","Delete",() => { dotgrid.undo(); },"Backspace");
    this.controller.add("default","Edit","Move Up",() => { dotgrid.mod_move(new Pos(0,-15)); },"Up");
    this.controller.add("default","Edit","Move Down",() => { dotgrid.mod_move(new Pos(0,15)); },"Down");
    this.controller.add("default","Edit","Move Left",() => { dotgrid.mod_move(new Pos(-15,0)); },"Left");
    this.controller.add("default","Edit","Move Right",() => { dotgrid.mod_move(new Pos(15,0)); },"Right");
    this.controller.add("default","Edit","Deselect",() => { dotgrid.reset(); },"Esc");

    this.controller.add("default","Stroke","Line",() => { dotgrid.draw_line(); },"A");
    this.controller.add("default","Stroke","Arc",() => { dotgrid.draw_arc("0,1"); },"S");
    this.controller.add("default","Stroke","Arc Rev",() => { dotgrid.draw_arc("0,0"); },"D");
    this.controller.add("default","Stroke","Bezier",() => { dotgrid.draw_bezier(); },"F");
    this.controller.add("default","Stroke","Close",() => { dotgrid.draw_close(); },"Z");

    this.controller.add("default","Effect","Thicker",() => { dotgrid.mod_thickness(1) },"]");
    this.controller.add("default","Effect","Thinner",() => { dotgrid.mod_thickness(-1) },"[");
    this.controller.add("default","Effect","Linecap",() => { dotgrid.mod_linecap(); },"/");
    this.controller.add("default","Effect","Mirror",() => { dotgrid.mod_mirror(); },"Space");
    this.controller.add("default","Effect","Fill",() => { dotgrid.toggle_fill(); },"G");
    
    this.controller.add("default","View","Tools",() => { dotgrid.interface.toggle(); },";");
    this.controller.add("default","View","Grid",() => { dotgrid.guide.toggle(); },"H");
    this.controller.add("default","View","Expert",() => { dotgrid.interface.toggle_zoom(); },":");

    this.controller.commit();

    window.addEventListener('drop', dotgrid.drag);

    dotgrid.set_size({width:300,height:300});
    this.draw();
  }

  // FILE

  this.new = function()
  {
    dotgrid.segments = [];
    dotgrid.draw();
  }

  this.save = function()
  {
    if(this.segments.length == 0){ return; }
    this.scale = 1
    this.draw();

    if(dotgrid.fill){ dotgrid.svg_el.style.fill = "black"; dotgrid.render.draw(); }

    var svg = dotgrid.svg_el.outerHTML;

    dialog.showSaveDialog((fileName) => {
      if (fileName === undefined){ return; }
      fs.writeFile(fileName+".svg", svg);
      fs.writeFile(fileName+'.png', dotgrid.render.buffer());
      fs.writeFile(fileName+'.dot', JSON.stringify(dotgrid.serializer.serialize()));
      dotgrid.draw()
    });
  }

  this.open = function()
  {
    var paths = dialog.showOpenDialog({properties: ['openFile'],filters:[{name:"Dotgrid Image",extensions:["dot"]}]});

    if(!paths){ console.log("Nothing to load"); return; }

    fs.readFile(paths[0], 'utf-8', (err, data) => {
      if(err){ alert("An error ocurred reading the file :" + err.message); return; }
      dotgrid.serializer.deserialize(JSON.parse(data.toString().trim()));
      dotgrid.draw();
    });
  }

  // EDIT

  this.undo = function()
  {
    if(from || to || end){
      dotgrid.reset();
    }
    else{
      dotgrid.segments.pop();
    }
    dotgrid.draw();
  }

  // STROKE

  this.draw_line = function()
  {
    if(from === null || to === null){ return; }

    to = new Pos(to.x * -1, to.y).sub(dotgrid.offset)
    from = new Pos(from.x * -1,from.y).sub(dotgrid.offset)
    end = end ? new Pos(end.x * -1,end.y).sub(dotgrid.offset) : null;

    dotgrid.segments.push(new Path_Line(from,to,end));

    dotgrid.reset();
    dotgrid.draw();
    dotgrid.reset();
  }

  this.draw_arc = function(orientation = "0,0")
  {
    if(from === null || to === null){ return; }

    to = new Pos(to.x * -1, to.y).sub(dotgrid.offset)
    from = new Pos(from.x * -1,from.y).sub(dotgrid.offset)
    end = end ? new Pos(end.x * -1,end.y).sub(dotgrid.offset) : null;

    dotgrid.segments.push(new Path_Arc(from,to,orientation,end));

    dotgrid.reset();
    dotgrid.draw();
    dotgrid.reset();
  }

  this.draw_bezier = function()
  {
    if(from === null || to === null || end === null){ return; }

    to = new Pos(to.x * -1, to.y).sub(dotgrid.offset)
    from = new Pos(from.x * -1,from.y).sub(dotgrid.offset)
    end = new Pos(end.x * -1,end.y).sub(dotgrid.offset)

    dotgrid.segments.push(new Path_Bezier(from,to,end));

    dotgrid.reset();
    dotgrid.draw();
    dotgrid.reset();
  }

  this.draw_close = function()
  {
    if(dotgrid.segments.length == 0){ return; }
    if(dotgrid.segments[dotgrid.segments.length-1].name == "close"){ return; }

    dotgrid.segments.push(new Path_Close());

    dotgrid.reset();
    dotgrid.draw();
    dotgrid.reset();
  }

  // Cursor

  this.translation = null;

  this.mouse_down = function(e)
  {
    var o = e.target.getAttribute("ar");

    var pos = this.position_in_grid(new Pos(e.clientX,e.clientY));
    pos = this.position_on_grid(pos);

    if(e.altKey){ dotgrid.delete_at(pos); return; }
    if(dotgrid.handle_at(pos)){ dotgrid.translation = {from:pos,to:pos}; return; }

    if(!o){ return; }

    if(o == "line"){ this.draw_line(); }
    if(o == "arc_c"){ this.draw_arc("0,1"); }
    if(o == "arc_r"){ this.draw_arc("0,0"); }
    if(o == "bezier"){ this.draw_bezier(); }
    if(o == "close"){ this.draw_close(); }

    if(o == "thickness"){ this.mod_thickness(); }
    if(o == "linecap"){ this.mod_linecap(); }
    if(o == "mirror"){ this.mod_mirror(); }
    if(o == "fill"){ this.toggle_fill(); }
    if(o == "export"){ this.save(); }
  }

  this.mouse_move = function(e)
  {
    var pos = this.position_in_grid(new Pos(e.clientX,e.clientY));
    pos = this.position_on_grid(pos);

    if(dotgrid.translation){ dotgrid.translation.to = pos; }

    var o = e.target.getAttribute("ar");
    dotgrid.preview(o);

    dotgrid.move_cursor(pos)
    dotgrid.guide.update();
  }

  this.mouse_up = function(e)
  {
    var pos = this.position_in_grid(new Pos(e.clientX,e.clientY));
    pos = this.position_on_grid(pos);

    if(e.altKey){ return; }

    if(pos.x>0) { dotgrid.translation = null; return; }

    if(dotgrid.translation && !dotgrid.translation.to.is_equal(dotgrid.translation.from) ){
      dotgrid.translate(dotgrid.translation);
      return;
    }

    dotgrid.translation = null;

    this.add_point(pos)
    this.draw();
  }

  this.move_cursor = function(pos)
  {
    if(pos.x>0) {
      this.cursor.style.visibility = "hidden"
    } else {
      if(this.cursor.style.visibility == "hidden") {
        this.cursor.style.transition = "initial"
      }
      this.cursor.style.visibility = "visible"
      this.cursor.style.left = Math.floor(-(pos.x-this.grid_width));
      this.cursor.style.top = Math.floor(pos.y+this.grid_height);
      this.cursor_coord.className = -pos.x > this.width/2 ? "fl left" : "fl"
      this.cursor_coord.textContent = parseInt(-pos.x/this.grid_width)+","+parseInt(pos.y/this.grid_height);
      window.setTimeout(() => dotgrid.cursor.style.transition = "all 50ms", 17 /*one frame*/)
    }
  }

  this.add_point = function(pos = new Pos(0,0))
  {
    if(from === null){ this.set_from(pos.scale(1/this.scale)); }
    else if(to === null){ this.set_to(pos.scale(1/this.scale)); }
    else{ this.set_end(pos.scale(1/this.scale)); }
  }

  this.handle_at = function(pos)
  {
    for(id in dotgrid.segments){
      var segment = dotgrid.segments[id];
      if(segment.from && segment.from.is_equal(pos)){ return true; }
      if(segment.to && segment.to.is_equal(pos)){ return true; }
      if(segment.end && segment.end.is_equal(pos)){ return true; }
    }
    return false;
  }

  this.translate = function(t)
  {
    for(id in dotgrid.segments){
      var segment = dotgrid.segments[id];
      if(segment.from && segment.from.is_equal(dotgrid.translation.from)){ segment.from = new Pos(-dotgrid.translation.to.x,dotgrid.translation.to.y)}
      if(segment.to && segment.to.is_equal(dotgrid.translation.from)){ segment.to = new Pos(-dotgrid.translation.to.x,dotgrid.translation.to.y)}
      if(segment.end && segment.end.is_equal(dotgrid.translation.from)){ segment.end = new Pos(-dotgrid.translation.to.x,dotgrid.translation.to.y)}
    }

    dotgrid.translation = null;
    dotgrid.reset();

    dotgrid.draw();
  }

  this.preview = function(operation)
  {
    if(from && to && operation == "line"){
      var d = new Path_Line(from.mirror(),to.mirror(),end ? end.mirror() : null).to_segment();
      this.preview_el.innerHTML = "<path d='"+d+"'></path>"
      return;
    }
    else if(from && to && operation == "arc_c"){
      var d = new Path_Arc(from.mirror(),to.mirror(),"0,1",end ? end.mirror() : null).to_segment();
      this.preview_el.innerHTML = "<path d='"+d+"'></path>"
      return;
    }
    else if(from && to && operation == "arc_r"){
      var d = new Path_Arc(from.mirror(),to.mirror(),"0,0",end ? end.mirror() : null).to_segment();
      this.preview_el.innerHTML = "<path d='"+d+"'></path>"
      return;
    }
    else if(from && to && operation == "bezier"){
      var d = new Path_Bezier(from.mirror(),to.mirror(),end ? end.mirror() : null).to_segment();
      this.preview_el.innerHTML = "<path d='"+d+"'></path>"
      return;
    }
    this.preview_el.innerHTML = "";
  }

  // Setters

  this.set_from = function(pos)
  {
    from = pos.mirror().clamp(0,this.width).mirror();

    cursor_from.style.left = Math.floor(-from.x*this.scale + this.grid_width);
    cursor_from.style.top = Math.floor(from.y*this.scale + this.grid_height);
  }

  this.set_to = function(pos)
  {
    to = pos.mirror().clamp(0,this.width).mirror();

    cursor_to.style.left = Math.floor(-to.x*this.scale + this.grid_width);
    cursor_to.style.top = Math.floor(to.y*this.scale + this.grid_height);
  }

  this.set_end = function(pos)
  {
    end = pos.mirror().clamp(0,this.width).mirror();

    cursor_end.style.left = Math.floor(-end.x*this.scale + this.grid_width);
    cursor_end.style.top = Math.floor(end.y*this.scale + this.grid_height);
  }

  this.delete_at = function(pos)
  {
    var segs = [];

    for(id in this.segments){
      var s = this.segments[id];
      if(s.from && s.from.is_equal(pos)){ continue; }
      if(s.to && s.to.is_equal(pos)){ continue; }
      if(s.end && s.end.is_equal(pos)){ continue; }
      segs.push(s);
    }
    this.segments = segs;
    this.draw();
  }

  this.mod_thickness = function(mod)
  {
    if(!mod){ mod = 1; this.thickness = this.thickness > 30 ? 1 : this.thickness }

    this.thickness = Math.max(this.thickness+mod,0);
    this.cursor_coord.textContent = this.thickness;
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
      var pos = new Pos(from.x-(move.x),from.y+(move.y))
      this.set_from(pos)
      this.move_cursor(pos)
      this.draw();
      return;
    }
    if(!end && to){
      var pos = new Pos(to.x-(move.x),to.y+(move.y))
      this.set_to(pos)
      this.move_cursor(pos)
      this.draw();
      return;
    }
    if(end){
      var pos = new Pos(end.x-(move.x),end.y+(move.y))
      this.set_end(pos)
      this.move_cursor(pos)
      this.draw();
      return;
    }
    this.draw();
  }

  this.mirror_index = 0;

  this.mod_mirror = function()
  {
    this.mirror_index += 1; 
    this.mirror_index = this.mirror_index > 3 ? 0 : this.mirror_index;
    this.draw();
  }

  this.toggle_fill = function()
  {
    dotgrid.fill = dotgrid.fill ? false : true;
    this.draw();
  }

  this.set_size = function(size = {width:300,height:300},interface = true) 
  {
    var win = require('electron').remote.getCurrentWindow();
    win.setSize(size.width+100,size.height+100+(interface ? 10 : 0),true);
    
    this.width = size.width
    this.height = size.height
    this.element.style.width = size.width+10
    this.element.style.height = size.height+10
    this.grid_x = size.width/15
    this.grid_y = size.height/15
    this.svg_el.setAttribute("width",size.width+"px");
    this.svg_el.setAttribute("height",size.height+"px");
    this.preview_el.style.width = size.width+10
    this.preview_el.style.height = size.height+10
    this.preview_el.setAttribute("width",size.width+"px");
    this.preview_el.setAttribute("height",size.height+"px");

    dotgrid.guide.resize(size);
    this.interface.update();
    this.draw();
  }

  this.draw = function(exp = false)
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
    this.svg_el.style.strokeWidth = this.thickness*this.scale;
    this.svg_el.style.fill = this.fill ? this.theme.active.f_high : "none";

    // Draw Mirror
    if(this.mirror_index == 1){
      this.mirror_path.setAttribute("d",d);
      this.mirror_path.setAttribute("transform","translate("+(this.width - (this.offset.x*this.scale))+","+(this.offset.y*this.scale)+"),scale(-1,1)")
    }
    else if(this.mirror_index == 2){
      this.mirror_path.setAttribute("d",d);
      this.mirror_path.setAttribute("transform","translate("+((this.offset.x*this.scale))+","+(this.height - (this.offset.y*this.scale))+"),scale(1,-1)")

    }
    else if(this.mirror_index == 3){
      this.mirror_path.setAttribute("d",d);
      this.mirror_path.setAttribute("transform","translate("+(this.width -(this.offset.x*this.scale))+","+(this.height - (this.offset.y*this.scale))+"),scale(-1,-1)")
    }
    else{
      this.mirror_path.setAttribute("d",'M0,0');
      this.mirror_path.setAttribute("transform","")
    }

    this.offset_el.setAttribute("transform","translate("+(this.offset.x*this.scale)+","+(this.offset.y*this.scale)+")")

    this.render.draw();
    this.interface.update();
    this.guide.update();
  }

  // Draw
  
  this.reset = function()
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

  this.clear = function()
  {
    this.reset();
    this.segments = [];
    this.thickness = 10
    this.linecap = "square"
    this.color = "#000000"
    this.draw();
  }

  this.drag = function(e)
  {
    e.preventDefault();
    e.stopPropagation();
    
    var file = e.dataTransfer.files[0];

    if(!file.name || !file.name.indexOf(".dot") < 0){ console.log("Dotgrid","Not a dot file"); return; }

    var reader = new FileReader();
    reader.onload = function(e){
      dotgrid.serializer.deserialize(JSON.parse(e.target.result.toString().trim()));
      dotgrid.draw();
    };
    reader.readAsText(file);
  }

  this.copy = function(e)
  {
    if(this.segments.length == 0){ return; }
    this.scale = 1
    this.width = 300
    this.height = 300
    this.draw();

    var svg = this.svg_el.outerHTML
    e.clipboardData.items.add(JSON.stringify(this.serializer.serialize()), "text/plain");
    e.clipboardData.items.add(svg, "text/html");
    e.clipboardData.items.add(svg, "text/svg+xml");
    e.preventDefault();
  }

  this.paste = function(e)
  {
    var data = e.clipboardData.getData("text/plain");
    try {
      data = JSON.parse(data.trim());
      if (!data || !data.dotgrid) throw null;
    } catch (err) {
      // Not a dotgrid JSON.
      return;
    }

    this.serializer.deserialize(data);
    this.draw();
  }

  // Normalizers

  this.position_in_grid = function(pos)
  {
    return new Pos((window.innerWidth/2) - (this.width/2) - pos.x,pos.y - (30+10*(this.scale)))
  }

  this.position_on_grid = function(pos)
  {
    pos.y = pos.y - 7.5
    pos.x = pos.x + 7.5
    x = Math.round(pos.x/this.grid_width)*this.grid_width
    y = Math.round(pos.y/this.grid_height)*this.grid_height
    off = (x<-this.width || x>0 || y>this.height || y<0)
    if(off) {
      x = 50
      y = -50
    }
    return new Pos(x,y);
  }

  // To Clean

  this.from = function()
  {
    return from;
  }

  this.to = function()
  {
    return to;
  }

  this.end = function()
  {
    return end;
  }
}

window.addEventListener('resize', function(e)
{
  dotgrid.draw()
}, false);

window.addEventListener('dragover',function(e)
{
  e.stopPropagation();
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
});