function Dotgrid(width,height,grid_x,grid_y,block_x,block_y)
{
  this.controller = new Controller();
  this.theme = new Theme();
  this.interface = new Interface();
  this.history = new History();
  this.guide = new Guide();
  this.render = new Render();
  this.tool = new Tool();
  this.keyboard = new Keyboard();
  this.picker = new Picker();

  this.width = width;
  this.height = height;
  this.grid_x = grid_x;
  this.grid_y = grid_y;
  this.block_x = block_x;
  this.block_y = block_y;

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
  this.layer_1 = document.createElementNS("http://www.w3.org/2000/svg", "path"); this.layer_1.id = "layer_1"; this.layer_1.style.stroke = "black";
  this.layer_2 = document.createElementNS("http://www.w3.org/2000/svg", "path"); this.layer_2.id = "layer_2"; this.layer_2.style.stroke = "#999";
  this.layer_3 = document.createElementNS("http://www.w3.org/2000/svg", "path"); this.layer_3.id = "layer_3"; this.layer_3.style.stroke = "#ccc";
  this.mirror_layer_1 = document.createElementNS("http://www.w3.org/2000/svg", "path"); this.mirror_layer_1.id = "mirror_layer_1"; this.mirror_layer_1.style.stroke = "black";
  this.mirror_layer_2 = document.createElementNS("http://www.w3.org/2000/svg", "path"); this.mirror_layer_2.id = "mirror_layer_2"; this.mirror_layer_2.style.stroke = "#999";
  this.mirror_layer_3 = document.createElementNS("http://www.w3.org/2000/svg", "path"); this.mirror_layer_3.id = "mirror_layer_3"; this.mirror_layer_3.style.stroke = "#ccc";

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
    this.svg_el.style.fill = "none";
    this.svg_el.style.strokeWidth = this.tool.style().thickness;
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
    this.preview_el.style.strokeLinecap = "round";
    this.preview_el.style.fill = "none";
    this.element.appendChild(this.preview_el);

    this.mirror_el.appendChild(this.mirror_layer_3)
    this.offset_el.appendChild(this.layer_3)
    this.mirror_el.appendChild(this.mirror_layer_2)
    this.offset_el.appendChild(this.layer_2)
    this.mirror_el.appendChild(this.mirror_layer_1)
    this.offset_el.appendChild(this.layer_1)
    this.svg_el.appendChild(this.offset_el);
    this.svg_el.appendChild(this.mirror_el);

    this.theme.start();
    this.tool.start();
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

    this.controller.add("default","Edit","Copy",() => { document.execCommand('copy'); },"CmdOrCtrl+C");
    this.controller.add("default","Edit","Cut",() => { document.execCommand('cut'); },"CmdOrCtrl+X");
    this.controller.add("default","Edit","Paste",() => { document.execCommand('paste'); },"CmdOrCtrl+V");
    this.controller.add("default","Edit","Undo",() => { dotgrid.tool.undo(); },"CmdOrCtrl+Z");
    this.controller.add("default","Edit","Redo",() => { dotgrid.tool.redo(); },"CmdOrCtrl+Shift+Z");
    this.controller.add("default","Edit","Delete",() => { dotgrid.tool.remove_segment(); },"Backspace");
    this.controller.add("default","Edit","Deselect",() => { dotgrid.tool.clear(); },"Esc");

    this.controller.add("default","Stroke","Line",() => { dotgrid.tool.cast("line"); },"A");
    this.controller.add("default","Stroke","Arc",() => { dotgrid.tool.cast("arc_c"); },"S"); // 0,1
    this.controller.add("default","Stroke","Arc Rev",() => { dotgrid.tool.cast("arc_r")},"D"); // 0,0
    this.controller.add("default","Stroke","Bezier",() => { dotgrid.tool.cast("bezier") },"F");
    this.controller.add("default","Stroke","Connect",() => { dotgrid.tool.cast("close") },"Z");

    this.controller.add("default","Effect","Linecap",() => { dotgrid.mod_linecap(); },"Q");
    this.controller.add("default","Effect","Linejoin",() => { dotgrid.mod_linejoin(); },"W");
    this.controller.add("default","Effect","Mirror",() => { dotgrid.mod_mirror(); },"E");
    this.controller.add("default","Effect","Fill",() => { dotgrid.mod_fill(); },"R");
    this.controller.add("default","Effect","Dash",() => { dotgrid.mod_dash(); },"T");
    this.controller.add("default","Effect","Color",() => { dotgrid.picker.start(); },"G");
    this.controller.add("default","Effect","Thicker",() => { dotgrid.mod_thickness(1) },"}");
    this.controller.add("default","Effect","Thinner",() => { dotgrid.mod_thickness(-1) },"{");
    this.controller.add("default","Effect","Thicker +5",() => { dotgrid.mod_thickness(5,true) },"]");
    this.controller.add("default","Effect","Thinner -5",() => { dotgrid.mod_thickness(-5,true) },"[");

    this.controller.add("default","Layers","Foreground",() => { dotgrid.tool.select_layer(0) },"CmdOrCtrl+1");
    this.controller.add("default","Layers","Middleground",() => { dotgrid.tool.select_layer(1) },"CmdOrCtrl+2");
    this.controller.add("default","Layers","Background",() => { dotgrid.tool.select_layer(2) },"CmdOrCtrl+3");

    this.controller.add("default","View","Tools",() => { dotgrid.interface.toggle(); },"U");
    this.controller.add("default","View","Grid",() => { dotgrid.guide.toggle(); },"H");
    this.controller.add("default","View","Control Points",() => { dotgrid.guide.toggle_widgets(); },"J");

    this.controller.add("default","Mode","Toggle Size",() => { dotgrid.interface.toggle_zoom(); },"CmdOrCtrl+E");
    this.controller.add("default","Mode","Keyboard",() => { dotgrid.keyboard.start(); },"CmdOrCtrl+K");
    this.controller.add("default","Mode","Picker",() => { dotgrid.picker.start(); },"CmdOrCtrl+P");

    this.controller.add("keyboard","*","About",() => { require('electron').shell.openExternal('https://github.com/hundredrabbits/Dotgrid'); },"CmdOrCtrl+,");
    this.controller.add("keyboard","*","Fullscreen",() => { app.toggle_fullscreen(); },"CmdOrCtrl+Enter");
    this.controller.add("keyboard","*","Hide",() => { app.toggle_visible(); },"CmdOrCtrl+H");
    this.controller.add("keyboard","*","Inspect",() => { app.inspect(); },"CmdOrCtrl+.");
    this.controller.add("keyboard","*","Documentation",() => { dotgrid.controller.docs(); },"CmdOrCtrl+Esc");
    this.controller.add("keyboard","*","Reset",() => { dotgrid.reset(); dotgrid.theme.reset(); },"CmdOrCtrl+Backspace");
    this.controller.add("keyboard","*","Quit",() => { app.exit(); },"CmdOrCtrl+Q");

    this.controller.add("keyboard","Controls","Add vertex",() => { dotgrid.keyboard.confirm(); },"Enter");
    this.controller.add("keyboard","Controls","Remove vertex",() => { dotgrid.keyboard.erase(); },"Backspace");

    this.controller.add("keyboard","Select","Move Up",() => { dotgrid.keyboard.move(0,1); },"Up");
    this.controller.add("keyboard","Select","Move Down",() => { dotgrid.keyboard.move(0,-1); },"Down");
    this.controller.add("keyboard","Select","Move Left",() => { dotgrid.keyboard.move(1,0); },"Left");
    this.controller.add("keyboard","Select","Move Right",() => { dotgrid.keyboard.move(-1,0); },"Right");

    this.controller.add("keyboard","Select","XXYY(0)",() => { dotgrid.keyboard.push(0); },"0");
    this.controller.add("keyboard","Select","XXYY(1)",() => { dotgrid.keyboard.push(1); },"1");
    this.controller.add("keyboard","Select","XXYY(2)",() => { dotgrid.keyboard.push(2); },"2");
    this.controller.add("keyboard","Select","XXYY(3)",() => { dotgrid.keyboard.push(3); },"3");
    this.controller.add("keyboard","Select","XXYY(4)",() => { dotgrid.keyboard.push(4); },"4");
    this.controller.add("keyboard","Select","XXYY(5)",() => { dotgrid.keyboard.push(5); },"5");
    this.controller.add("keyboard","Select","XXYY(6)",() => { dotgrid.keyboard.push(6); },"6");
    this.controller.add("keyboard","Select","XXYY(7)",() => { dotgrid.keyboard.push(7); },"7");
    this.controller.add("keyboard","Select","XXYY(8)",() => { dotgrid.keyboard.push(8); },"8");
    this.controller.add("keyboard","Select","XXYY(9)",() => { dotgrid.keyboard.push(9); },"9");
    
    this.controller.add("keyboard","Mode","Stop Keyboard Mode",() => { dotgrid.keyboard.stop(); },"Escape");

    this.controller.add("picker","*","About",() => { require('electron').shell.openExternal('https://github.com/hundredrabbits/Dotgrid'); },"CmdOrCtrl+,");
    this.controller.add("picker","*","Fullscreen",() => { app.toggle_fullscreen(); },"CmdOrCtrl+Enter");
    this.controller.add("picker","*","Hide",() => { app.toggle_visible(); },"CmdOrCtrl+H");
    this.controller.add("picker","*","Inspect",() => { app.inspect(); },"CmdOrCtrl+.");
    this.controller.add("picker","*","Documentation",() => { dotgrid.controller.docs(); },"CmdOrCtrl+Esc");
    this.controller.add("picker","*","Reset",() => { dotgrid.reset(); dotgrid.theme.reset(); },"CmdOrCtrl+Backspace");
    this.controller.add("picker","*","Quit",() => { app.exit(); },"CmdOrCtrl+Q");

    this.controller.add_role("picker","Edit","undo");
    this.controller.add_role("picker","Edit","redo");
    this.controller.add_role("picker","Edit","cut");
    this.controller.add_role("picker","Edit","copy");
    this.controller.add_role("picker","Edit","paste");
    this.controller.add_role("picker","Edit","delete");
    this.controller.add_role("picker","Edit","selectall");

    this.controller.add("picker","Mode","Stop Picker Mode",() => { dotgrid.picker.stop(); },"Escape");
    
    this.controller.commit();

    document.addEventListener('mousedown', function(e){ dotgrid.mouse_down(e); }, false);
    document.addEventListener('mousemove', function(e){ dotgrid.mouse_move(e); }, false);
    document.addEventListener('contextmenu', function(e){ dotgrid.mouse_alt(e); }, false);
    document.addEventListener('mouseup', function(e){ dotgrid.mouse_up(e);}, false);
    document.addEventListener('copy', function(e){ dotgrid.copy(e); e.preventDefault(); }, false);
    document.addEventListener('cut', function(e){ dotgrid.cut(e); e.preventDefault(); }, false);
    document.addEventListener('paste', function(e){ dotgrid.paste(e); e.preventDefault(); }, false);

    window.addEventListener('drop', dotgrid.drag);

    dotgrid.set_size({width:300,height:300});
    
    this.new();
  }

  // FILE

  this.new = function()
  {
    this.history.push(this.tool.layers);
    dotgrid.clear();
  }

  this.save = function()
  {
    this.draw();

    var svg = dotgrid.svg_el.outerHTML;

    dialog.showSaveDialog((fileName) => {
      if (fileName === undefined){ return; }
      fs.writeFile(fileName+".svg", svg);
      fs.writeFile(fileName+'.png', dotgrid.render.buffer());
      fs.writeFile(fileName+'.dot', dotgrid.tool.export());
      dotgrid.draw()
    });
  }

  this.open = function()
  {
    var paths = dialog.showOpenDialog({properties: ['openFile'],filters:[{name:"Dotgrid Image",extensions:["dot"]}]});

    if(!paths){ console.log("Nothing to load"); return; }

    fs.readFile(paths[0], 'utf-8', (err, data) => {
      if(err){ alert("An error ocurred reading the file :" + err.message); return; }
      dotgrid.tool.replace(JSON.parse(data.toString().trim()));
      dotgrid.draw();
    });
  }

  // Cursor

  this.translation = null;
  this.translation_multi = null;

  this.mouse_down = function(e)
  {
    var pos = this.position_in_grid({x:e.clientX+5,y:e.clientY-5}); pos = this.position_on_grid(pos);

    if(e.altKey){ dotgrid.tool.remove_segments_at(pos); return; }
    
    if(dotgrid.tool.vertex_at(pos)){ 
      console.log("Begin translation"); dotgrid.translation = {from:pos,to:pos}; 
      if(e.shiftKey){ console.log("Begin translation(multi)"); dotgrid.translation_multi = true; }
      return; 
    }

    var o = e.target.getAttribute("ar");
    if(!o){ return; }

    if(o == "line"){ this.tool.cast("line"); }
    if(o == "arc_c"){ this.tool.cast("arc_c"); }
    if(o == "arc_r"){ this.tool.cast("arc_r"); }
    if(o == "bezier"){ this.tool.cast("bezier"); }
    if(o == "close"){ this.tool.cast("close"); }

    if(o == "thickness"){ this.mod_thickness(); }
    if(o == "linecap"){ this.mod_linecap(); }
    if(o == "linejoin"){ this.mod_linejoin(); }
    if(o == "mirror"){ this.mod_mirror(); }
    if(o == "fill"){ this.mod_fill(); }
    if(o == "color"){ setTimeout(()=>{ this.picker.start(); }, 100) }
    if(o == "depth"){ this.tool.select_next_layer(); }

    e.preventDefault();
  }

  this.mouse_move = function(e)
  {
    var pos = this.position_in_grid({x:e.clientX+5,y:e.clientY-5}); pos = this.position_on_grid(pos);

    if(dotgrid.translation && (Math.abs(dotgrid.translation.from.x) != Math.abs(pos.x) || Math.abs(dotgrid.translation.from.y) != Math.abs(pos.y))){ dotgrid.translation.to = pos; }

    dotgrid.preview(e.target.getAttribute("ar"));
    dotgrid.move_cursor(pos)
    dotgrid.guide.update();
    e.preventDefault();
  }

  this.mouse_up = function(e)
  {
    var pos = this.position_in_grid({x:e.clientX+5,y:e.clientY-5}); pos = this.position_on_grid(pos);

    if(e.altKey){ return; }

    if(pos.x > 0) { dotgrid.translation = null; return; }

    if(dotgrid.translation && (Math.abs(dotgrid.translation.from.x) != Math.abs(dotgrid.translation.to.x) || Math.abs(dotgrid.translation.from.y) != Math.abs(dotgrid.translation.to.y))){
      if(dotgrid.translation_multi){
        dotgrid.tool.translate_multi(dotgrid.translation.from,dotgrid.translation.to);
      }
      else{
        dotgrid.tool.translate(dotgrid.translation.from,dotgrid.translation.to);  
      }
      dotgrid.translation = null;
      dotgrid.translation_multi = null;
      this.draw();
      e.preventDefault();
      return;
    }

    this.tool.add_vertex({x:pos.x * -1,y:pos.y});
    dotgrid.translation = null;
    this.draw();
    e.preventDefault();
  }

  this.mouse_alt = function(e)
  {
    var pos = this.position_in_grid({x:e.clientX+5,y:e.clientY-5}); pos = this.position_on_grid(pos);
    dotgrid.tool.remove_segments_at(pos);
    e.preventDefault();
    setTimeout(() => { dotgrid.tool.clear(); },150);
  }

  function pos_is_equal(a,b)
  {
    return a && b && a.x == b.x && a.y == b.y
  }

  this.cursor_prev = null;

  this.move_cursor = function(pos, force = false)
  {
    if(pos_is_equal(pos,this.cursor_prev) && !force){ return; }

    if(pos.x>0) {
      this.cursor.style.visibility = "hidden"
    } else {
      if(this.cursor.style.visibility == "hidden") {
        this.cursor.style.transition = "initial"
      }
      this.cursor.style.visibility = "visible"
      this.cursor.style.left = Math.floor(-(pos.x-this.grid_width));
      this.cursor.style.top = Math.floor(pos.y+this.grid_height);
      this.cursor_x.style.left = `${-pos.x}px`;
      this.cursor_x.textContent = parseInt(-pos.x/this.grid_width)
      this.cursor_y.style.top = `${pos.y}px`;
      this.cursor_y.textContent = parseInt(pos.y/this.grid_width)
      window.setTimeout(() => dotgrid.cursor.style.transition = "all 50ms", 17 /*one frame*/)
    }
    this.cursor_prev = pos;
  }

  this.preview_prev = null

  this.preview = function(operation)
  {
    if(this.preview_prev == operation){ return; }
    this.preview_el.innerHTML = !operation ? `<path d='M0,0'></path>` : `<path d='${dotgrid.tool.path([{type:operation,verteces:dotgrid.tool.verteces}])}'></path>`;
    this.preview_prev = operation;
  }

  // Toggles

  this.mod_thickness = function(mod,step = false)
  {
    if(!mod){ mod = 1; this.tool.style().thickness = this.tool.style().thickness > 30 ? 1 : this.tool.style().thickness }

    if(step){
      this.tool.style().thickness = parseInt(this.tool.style().thickness/5) * 5;
    }

    this.tool.style().thickness = Math.max(this.tool.style().thickness+mod,0);
    this.cursor_x.textContent = this.tool.style().thickness;
    this.draw();
  }

  this.mod_linecap_index = 1;

  this.mod_linecap = function(mod)
  {
    var a = ["butt","square","round"];
    this.mod_linecap_index += 1;
    this.tool.style().strokeLinecap = a[this.mod_linecap_index % a.length];
    this.draw();
  }

  this.mod_linejoin_index = 1;

  this.mod_linejoin = function(mod)
  {
    var a = ["miter","round","bevel"];
    this.mod_linejoin_index += 1;
    this.tool.style().strokeLinejoin = a[this.mod_linejoin_index % a.length];
    this.draw();
  }

  this.mirror_index = 0;

  this.mod_mirror = function()
  {
    this.mirror_index += 1; 
    this.mirror_index = this.mirror_index > 3 ? 0 : this.mirror_index;
    this.draw();
  }

  this.mod_fill = function()
  {
    this.tool.style().fill = this.tool.style().fill == "none" ? this.tool.style().color : "none";
    this.draw();
  }

  this.dash_index = 0;

  this.mod_dash = function()
  {
    var styles = [[0,0],[0.1,1.25],[1.5,1.25],[2,1.25]]
    this.dash_index += 1; 
    this.dash_index = this.dash_index > styles.length-1 ? 0 : this.dash_index;
    this.tool.style().dash = styles[this.dash_index]
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
    console.log("draw")
    var paths = this.tool.paths();
    var d = this.tool.path();
    this.layer_1.setAttribute("d",paths[0]);
    this.layer_2.setAttribute("d",paths[1]);
    this.layer_3.setAttribute("d",paths[2]);
    
    this.mirror_layer_1.setAttribute("d",this.mirror_index > 0 ? paths[0] : "M0,0");
    this.mirror_layer_2.setAttribute("d",this.mirror_index > 0 ? paths[1] : "M0,0");
    this.mirror_layer_3.setAttribute("d",this.mirror_index > 0 ? paths[2] : "M0,0");

    this.svg_el.style.width = this.width;
    this.svg_el.style.height = this.height;

    this.layer_1.style.strokeWidth = this.tool.styles[0].thickness;
    this.layer_1.style.strokeLinecap = this.tool.styles[0].strokeLinecap;
    this.layer_1.style.strokeLinejoin = this.tool.styles[0].strokeLinejoin;
    this.layer_1.style.stroke = this.tool.styles[0].color;
    this.layer_1.style.fill = this.tool.styles[0].fill;
    this.layer_1.style.strokeDasharray = `${this.tool.styles[0].dash[0] * this.tool.styles[0].thickness},${this.tool.styles[0].dash[1] * this.tool.styles[0].thickness}`;
    this.mirror_layer_1.style.strokeWidth = this.tool.styles[0].thickness;
    this.mirror_layer_1.style.strokeLinecap = this.tool.styles[0].strokeLinecap;
    this.mirror_layer_1.style.strokeLinejoin = this.tool.styles[0].strokeLinejoin;
    this.mirror_layer_1.style.stroke = this.tool.styles[0].color;
    this.mirror_layer_1.style.fill = this.tool.styles[0].fill;
    this.mirror_layer_1.style.strokeDasharray = `${this.tool.styles[0].dash[0] * this.tool.styles[0].thickness},${this.tool.styles[0].dash[1] * this.tool.styles[0].thickness}`;

    this.layer_2.style.strokeWidth = this.tool.styles[1].thickness;
    this.layer_2.style.strokeLinecap = this.tool.styles[1].strokeLinecap;
    this.layer_2.style.strokeLinejoin = this.tool.styles[1].strokeLinejoin;
    this.layer_2.style.stroke = this.tool.styles[1].color;
    this.layer_2.style.fill = this.tool.styles[1].fill;
    this.layer_2.style.strokeDasharray = `${this.tool.styles[1].dash[0] * this.tool.styles[1].thickness},${this.tool.styles[1].dash[1] * this.tool.styles[1].thickness}`;
    this.mirror_layer_2.style.strokeWidth = this.tool.styles[1].thickness;
    this.mirror_layer_2.style.strokeLinecap = this.tool.styles[1].strokeLinecap;
    this.mirror_layer_2.style.strokeLinejoin = this.tool.styles[1].strokeLinejoin;
    this.mirror_layer_2.style.stroke = this.tool.styles[1].color;
    this.mirror_layer_2.style.fill = this.tool.styles[1].fill;
    this.mirror_layer_2.style.strokeDasharray = `${this.tool.styles[1].dash[0] * this.tool.styles[1].thickness},${this.tool.styles[1].dash[1] * this.tool.styles[1].thickness}`;

    this.layer_3.style.strokeWidth = this.tool.styles[2].thickness;
    this.layer_3.style.strokeLinecap = this.tool.styles[2].strokeLinecap;
    this.layer_3.style.strokeLinejoin = this.tool.styles[2].strokeLinejoin;
    this.layer_3.style.stroke = this.tool.styles[2].color;
    this.layer_3.style.fill = this.tool.styles[2].fill;
    this.layer_3.style.strokeDasharray = `${this.tool.styles[2].dash[0] * this.tool.styles[2].thickness},${this.tool.styles[2].dash[1] * this.tool.styles[2].thickness}`;
    this.mirror_layer_3.style.strokeWidth = this.tool.styles[2].thickness;
    this.mirror_layer_3.style.strokeLinecap = this.tool.styles[2].strokeLinecap;
    this.mirror_layer_3.style.strokeLinejoin = this.tool.styles[2].strokeLinejoin;
    this.mirror_layer_3.style.stroke = this.tool.styles[2].color;
    this.mirror_layer_3.style.fill = this.tool.styles[2].fill;
    this.mirror_layer_3.style.strokeDasharray = `${this.tool.styles[2].dash[0] * this.tool.styles[2].thickness},${this.tool.styles[2].dash[1] * this.tool.styles[2].thickness}`;

    // Draw Mirror
    if(this.mirror_index == 1){
      this.mirror_layer_1.setAttribute("transform",`translate(${this.width},0),scale(-1,1)`)
      this.mirror_layer_2.setAttribute("transform",`translate(${this.width},0),scale(-1,1)`)
      this.mirror_layer_3.setAttribute("transform",`translate(${this.width},0),scale(-1,1)`)
    }
    else if(this.mirror_index == 2){
      this.mirror_layer_1.setAttribute("transform",`translate(0,${this.height}),scale(1,-1)`)
      this.mirror_layer_2.setAttribute("transform",`translate(0,${this.height}),scale(1,-1)`)
      this.mirror_layer_3.setAttribute("transform",`translate(0,${this.height}),scale(1,-1)`)
    }
    else if(this.mirror_index == 3){
      this.mirror_layer_1.setAttribute("transform",`translate(${this.width},${this.height}),scale(-1,-1)`)
      this.mirror_layer_2.setAttribute("transform",`translate(${this.width},${this.height}),scale(-1,-1)`)
      this.mirror_layer_3.setAttribute("transform",`translate(${this.width},${this.height}),scale(-1,-1)`)
    }
    else{
      this.mirror_layer_1.setAttribute("transform","")
      this.mirror_layer_2.setAttribute("transform","")
      this.mirror_layer_3.setAttribute("transform","")
    }

    this.offset_el.setAttribute("transform","translate(0,0)")

    this.preview();
    this.render.draw();
    this.interface.update();
    this.guide.update();
  }

  // Draw
  
  this.reset = function()
  {
    this.tool.clear();
  }

  this.clear = function()
  {
    this.history.clear();
    this.tool.reset();
    this.reset();
    this.draw();
  }

  this.drag = function(e)
  {
    e.preventDefault();
    e.stopPropagation();
    
    var file = e.dataTransfer.files[0];

    if(!file.path || file.path.indexOf(".dot") < 0){ console.log("Dotgrid","Not a dot file"); return; }

    var reader = new FileReader();
    reader.onload = function(e){
      dotgrid.tool.replace(JSON.parse(e.target.result.toString().trim()));
      dotgrid.draw();
    };
    reader.readAsText(file);
  }

  this.copy = function(e)
  {
    dotgrid.width = 300
    dotgrid.height = 300
    dotgrid.draw();

    var svg = dotgrid.svg_el.outerHTML;

    e.clipboardData.setData('text/source', dotgrid.tool.export(dotgrid.tool.layer()));
    e.clipboardData.setData('text/plain', dotgrid.tool.path());
    e.clipboardData.setData('text/html', svg);
    e.clipboardData.setData('text/svg+xml', svg);

    this.draw();
  }

  this.cut = function(e)
  {
    dotgrid.width = 300
    dotgrid.height = 300
    dotgrid.draw();

    var svg = dotgrid.svg_el.outerHTML;

    e.clipboardData.setData('text/plain', dotgrid.tool.export(dotgrid.tool.layer()));
    e.clipboardData.setData('text/html', svg);
    e.clipboardData.setData('text/svg+xml', svg);

    dotgrid.tool.layers[dotgrid.tool.index] = [];

    this.draw();
  }

  this.paste = function(e)
  {
    var data = e.clipboardData.getData("text/source");
    data = JSON.parse(data.trim());
    dotgrid.tool.import(data);
    this.draw();
  }

  // Normalizers

  this.position_in_grid = function(pos)
  {
    return {x:(window.innerWidth/2) - (this.width/2) - pos.x,y:pos.y - (30+10)}
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
    return {x:x,y:y};
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

String.prototype.capitalize = function()
{
  return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
}