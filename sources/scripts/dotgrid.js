function Dotgrid(width,height,grid_x,grid_y,block_x,block_y,thickness = 3,linecap = "round",linejoin = "round", color = "#000000")
{
  this.controller = new Controller();
  this.theme = new Theme();
  this.interface = new Interface();
  this.history = new History();
  this.guide = new Guide();
  this.render = new Render();
  this.serializer = new Serializer();
  this.project = new Project();
  this.tool = new Tool();

  this.width = width;
  this.height = height;
  this.grid_x = grid_x;
  this.grid_y = grid_y;
  this.block_x = block_x;
  this.block_y = block_y;

  this.thickness = thickness;
  this.linecap = linecap;
  this.linejoin = linejoin;
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

  this.svg_el = null;
  this.mirror_el = null;
  this.mirror = false;
  this.fill = false;
  this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  this.segments = [];
  this.scale = 1;

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

    this.cursor_x = document.createElement("t");
    this.cursor_x.id = "cursor_x";
    this.cursor_x.className = "fl"
    this.element.appendChild(this.cursor_x);

    this.cursor_y = document.createElement("t");
    this.cursor_y.id = "cursor_y";
    this.cursor_y.className = "fl"
    this.element.appendChild(this.cursor_y);

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
    this.svg_el.style.strokeLinejoin = this.linejoin;
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

    this.controller.add("default","Edit","Insert",() => { dotgrid.add_point(); },"I");
    this.controller.add("default","Edit","Copy",() => { document.execCommand('copy'); },"CmdOrCtrl+C");
    this.controller.add("default","Edit","Paste",() => { document.execCommand('paste'); },"CmdOrCtrl+V");
    this.controller.add("default","Edit","Undo",() => { dotgrid.undo(); },"CmdOrCtrl+Z");
    this.controller.add("default","Edit","Redo",() => { dotgrid.redo(); },"CmdOrCtrl+Shift+Z");
    this.controller.add("default","Edit","Delete",() => { dotgrid.tool.remove_segment(); },"Backspace");
    this.controller.add("default","Edit","Move Up",() => { dotgrid.mod_move(new Pos(0,-15)); },"Up");
    this.controller.add("default","Edit","Move Down",() => { dotgrid.mod_move(new Pos(0,15)); },"Down");
    this.controller.add("default","Edit","Move Left",() => { dotgrid.mod_move(new Pos(-15,0)); },"Left");
    this.controller.add("default","Edit","Move Right",() => { dotgrid.mod_move(new Pos(15,0)); },"Right");
    this.controller.add("default","Edit","Deselect",() => { dotgrid.reset(); },"Esc");

    this.controller.add("default","Stroke","Line",() => { dotgrid.tool.cast("line"); },"A");
    this.controller.add("default","Stroke","Arc",() => { dotgrid.draw_arc("0,1"); },"S");
    this.controller.add("default","Stroke","Arc Rev",() => { dotgrid.draw_arc("0,0"); },"D");
    this.controller.add("default","Stroke","Bezier",() => { dotgrid.draw_bezier(); },"F");
    this.controller.add("default","Stroke","Connect",() => { dotgrid.draw_close(); },"Z");

    this.controller.add("default","Effect","Thicker",() => { dotgrid.mod_thickness(1) },"}");
    this.controller.add("default","Effect","Thinner",() => { dotgrid.mod_thickness(-1) },"{");
    this.controller.add("default","Effect","Thicker +5",() => { dotgrid.mod_thickness(5,true) },"]");
    this.controller.add("default","Effect","Thinner -5",() => { dotgrid.mod_thickness(-5,true) },"[");
    this.controller.add("default","Effect","Linecap",() => { dotgrid.mod_linecap(); },"Y");
    this.controller.add("default","Effect","Linejoin",() => { dotgrid.mod_linejoin(); },"T");
    this.controller.add("default","Effect","Mirror",() => { dotgrid.mod_mirror(); },"Space");
    this.controller.add("default","Effect","Fill",() => { dotgrid.toggle_fill(); },"G");
    
    this.controller.add("default","View","Tools",() => { dotgrid.interface.toggle(); },"U");
    this.controller.add("default","View","Grid",() => { dotgrid.guide.toggle(); },"H");
    this.controller.add("default","View","Control Points",() => { dotgrid.guide.toggle_widgets(); },"J");
    this.controller.add("default","View","Expert Mode",() => { dotgrid.interface.toggle_zoom(); },":");

    this.controller.commit();

    document.addEventListener('mousedown', function(e){ dotgrid.mouse_down(e); }, false);
    document.addEventListener('mousemove', function(e){ dotgrid.mouse_move(e); }, false);
    document.addEventListener('mouseup', function(e){ dotgrid.mouse_up(e);}, false);
    document.addEventListener('copy', function(e){ dotgrid.copy(e); e.preventDefault(); }, false);
    document.addEventListener('paste', function(e){ dotgrid.paste(e); e.preventDefault(); }, false);

    window.addEventListener('drop', dotgrid.drag);

    dotgrid.set_size({width:300,height:300});
    
    this.new();
  }

  // FILE

  this.new = function()
  {
    dotgrid.clear();
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
    // this.segments = this.history.prev();
    this.draw();
  }

  this.redo = function()
  {
    // this.segments = this.history.next();
    this.draw();    
  }

  this.delete_at = function(pos)
  {
    // var segs = [];

    // for(id in this.segments){
    //   var s = this.segments[id];
    //   if(s.from && s.from.is_equal(pos)){ continue; }
    //   if(s.to && s.to.is_equal(pos)){ continue; }
    //   if(s.end && s.end.is_equal(pos)){ continue; }
    //   segs.push(s);
    // }
    // this.segments = segs;
    // dotgrid.history.push(dotgrid.segments);
    this.draw();
  }

  // STROKE

  this.draw_arc = function(orientation = "0,0")
  {
    if(from === null || to === null){ return; }

    to = new Pos(to.x * -1, to.y).sub(dotgrid.offset)
    from = new Pos(from.x * -1,from.y).sub(dotgrid.offset)
    end = end ? new Pos(end.x * -1,end.y).sub(dotgrid.offset) : null;

    dotgrid.segments.push(new Path_Arc(from,to,orientation,end));
    dotgrid.history.push(dotgrid.segments);

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
    dotgrid.history.push(dotgrid.segments);

    dotgrid.reset();
    dotgrid.draw();
    dotgrid.reset();
  }

  this.draw_close = function()
  {
    if(dotgrid.segments.length == 0){ return; }
    if(dotgrid.segments[dotgrid.segments.length-1].name == "close"){ return; }

    dotgrid.segments.push(new Path_Close());
    dotgrid.history.push(dotgrid.segments);

    dotgrid.reset();
    dotgrid.draw();
    dotgrid.reset();
  }


  // Cursor

  this.translation = null;

  this.mouse_down = function(e)
  {
    var o = e.target.getAttribute("ar");

    var pos = this.position_in_grid(new Pos(e.clientX+5,e.clientY-5));
    pos = this.position_on_grid(pos);

    if(e.altKey){ dotgrid.delete_at(pos); return; }
    if(dotgrid.tool.vertex_at(pos)){ dotgrid.translation = {from:pos,to:pos}; return; }

    if(!o){ return; }

    if(o == "line"){ this.tool.cast("line"); }
    if(o == "arc_c"){ this.draw_arc("0,1"); }
    if(o == "arc_r"){ this.draw_arc("0,0"); }
    if(o == "bezier"){ this.draw_bezier(); }
    if(o == "close"){ this.draw_close(); }

    if(o == "thickness"){ this.mod_thickness(); }
    if(o == "linecap"){ this.mod_linecap(); }
    if(o == "linejoin"){ this.mod_linejoin(); }
    if(o == "mirror"){ this.mod_mirror(); }
    if(o == "fill"){ this.toggle_fill(); }
    if(o == "export"){ this.save(); }
  }

  this.mouse_move = function(e)
  {
    var pos = this.position_in_grid(new Pos(e.clientX+5,e.clientY-5));
    pos = this.position_on_grid(pos);

    if(dotgrid.translation){ dotgrid.translation.to = pos; }

    var o = e.target.getAttribute("ar");
    dotgrid.preview(o);

    dotgrid.move_cursor(pos)
    dotgrid.guide.update();
  }

  this.mouse_up = function(e)
  {
    var pos = this.position_in_grid(new Pos(e.clientX+5,e.clientY-5));
    pos = this.position_on_grid(pos);

    if(e.altKey){ return; }

    if(pos.x>0) { dotgrid.translation = null; return; }

    if(dotgrid.translation){
      dotgrid.tool.translate(dotgrid.translation.from,dotgrid.translation.to);
      dotgrid.translation = null;
      return;
    }

    this.tool.add_vertex({x:pos.x * -1,y:pos.y});
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
      this.update_cursor(pos);
      window.setTimeout(() => dotgrid.cursor.style.transition = "all 50ms", 17 /*one frame*/)
    }
  }

  this.update_cursor = function(pos)
  {
    this.cursor_x.style.left = `${-pos.x}px`;
    this.cursor_x.textContent = parseInt(-pos.x/this.grid_width)
    this.cursor_y.style.top = `${pos.y}px`;
    this.cursor_y.textContent = parseInt(pos.y/this.grid_width)
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

  this.preview = function(operation)
  {
    // if(from && to && operation == "line"){
    //   var d = new Path_Line(from.mirror(),to.mirror(),end ? end.mirror() : null).to_segment();
    //   this.preview_el.innerHTML = "<path d='"+d+"'></path>"
    //   return;
    // }
    // else if(from && to && operation == "arc_c"){
    //   var d = new Path_Arc(from.mirror(),to.mirror(),"0,1",end ? end.mirror() : null).to_segment();
    //   this.preview_el.innerHTML = "<path d='"+d+"'></path>"
    //   return;
    // }
    // else if(from && to && operation == "arc_r"){
    //   var d = new Path_Arc(from.mirror(),to.mirror(),"0,0",end ? end.mirror() : null).to_segment();
    //   this.preview_el.innerHTML = "<path d='"+d+"'></path>"
    //   return;
    // }
    // else if(from && to && operation == "bezier"){
    //   var d = new Path_Bezier(from.mirror(),to.mirror(),end ? end.mirror() : null).to_segment();
    //   this.preview_el.innerHTML = "<path d='"+d+"'></path>"
    //   return;
    // }
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

  this.mod_thickness = function(mod,step = false)
  {
    if(!mod){ mod = 1; this.thickness = this.thickness > 30 ? 1 : this.thickness }

    if(step){
      this.thickness = parseInt(this.thickness/5) * 5;
    }

    this.thickness = Math.max(this.thickness+mod,0);
    this.cursor_x.textContent = this.thickness;
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

  this.mod_linejoin_index = 1;

  this.mod_linejoin = function(mod)
  {
    var a = ["miter","round","bevel"];
    this.mod_linejoin_index += 1;
    this.linejoin = a[this.mod_linejoin_index % a.length];
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

    this.path.setAttribute("d",this.tool.path());

    this.svg_el.style.width = this.width;
    this.svg_el.style.height = this.height;
    this.svg_el.style.stroke = this.color;
    this.svg_el.style.strokeLinecap = this.linecap;
    this.svg_el.style.strokeLinejoin = this.linejoin;
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
    console.log("TODO")
  }

  this.clear = function()
  {
    this.history.clear();
    this.reset();
    this.segments = [];
    this.thickness = 10
    this.linecap = "square"
    this.linejoin = "round"
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
    if(dotgrid.segments.length == 0){ return; }

    dotgrid.scale = 1
    dotgrid.width = 300
    dotgrid.height = 300
    dotgrid.draw();

    var svg = dotgrid.svg_el.outerHTML;

    e.clipboardData.setData('text/plain', JSON.stringify(dotgrid.serializer.serialize()));
    e.clipboardData.setData('text/html', svg);
    e.clipboardData.setData('text/svg+xml', svg);
  }

  this.paste = function(e)
  {
    var data = e.clipboardData.getData("text/plain");
    try {
      data = JSON.parse(data.trim());
      if (!data || !data.dotgrid) throw null;
    } catch (err) {
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
