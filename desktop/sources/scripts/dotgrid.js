function Dotgrid(width,height,grid_x,grid_y,block_x,block_y)
{
  this.controller = new Controller();
  this.theme = new Theme();
  this.interface = new Interface();
  this.history = new History();
  this.guide = new Guide();
  this.render = new Render();
  this.tool = new Tool();
  this.picker = new Picker();

  this.grid_x = grid_x;
  this.grid_y = grid_y;
  this.block_x = block_x;
  this.block_y = block_y;

  this.svg_el = null;
  this.layer_1 = document.createElementNS("http://www.w3.org/2000/svg", "path"); this.layer_1.id = "layer_1"; this.layer_1.style.stroke = "black";
  this.layer_2 = document.createElementNS("http://www.w3.org/2000/svg", "path"); this.layer_2.id = "layer_2"; this.layer_2.style.stroke = "#999";
  this.layer_3 = document.createElementNS("http://www.w3.org/2000/svg", "path"); this.layer_3.id = "layer_3"; this.layer_3.style.stroke = "#ccc";
  
  this.cursor = { pos:{x:0,y:0},translation:null,multi:false,updated:0 }

  this.install = function()
  {  
    document.getElementById("app").appendChild(this.guide.el);
    
    // Vector
    this.svg_el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg_el.id = "vector"
    this.svg_el.setAttribute("class","vector");
    this.svg_el.setAttribute("width",this.tool.settings.size.width+"px");
    this.svg_el.setAttribute("height",this.tool.settings.size.height+"px");
    this.svg_el.setAttribute("xmlns","http://www.w3.org/2000/svg");
    this.svg_el.setAttribute("baseProfile","full");
    this.svg_el.setAttribute("version","1.1");

    this.svg_el.style.width = this.tool.settings.size.width;
    this.svg_el.style.height = this.tool.settings.size.height;
    this.svg_el.style.fill = "none";
    this.svg_el.style.strokeWidth = this.tool.style().thickness;

    this.svg_el.appendChild(this.layer_3);
    this.svg_el.appendChild(this.layer_2);
    this.svg_el.appendChild(this.layer_1);

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
    this.controller.add("default","Effect","Color",() => { dotgrid.picker.start(); },"G");
    this.controller.add("default","Effect","Thicker",() => { dotgrid.mod_thickness(1) },"}");
    this.controller.add("default","Effect","Thinner",() => { dotgrid.mod_thickness(-1) },"{");
    this.controller.add("default","Effect","Thicker +5",() => { dotgrid.mod_thickness(5,true) },"]");
    this.controller.add("default","Effect","Thinner -5",() => { dotgrid.mod_thickness(-5,true) },"[");

    this.controller.add("default","Manual","Add Point",() => { dotgrid.tool.add_vertex(dotgrid.cursor.pos); dotgrid.draw() },"Enter");
    this.controller.add("default","Manual","Move Up",() => { dotgrid.cursor.pos.y -= 15; dotgrid.draw() },"Up");
    this.controller.add("default","Manual","Move Right",() => { dotgrid.cursor.pos.x -= 15; dotgrid.draw() },"Right");
    this.controller.add("default","Manual","Move Down",() => { dotgrid.cursor.pos.y += 15; dotgrid.draw() },"Down");
    this.controller.add("default","Manual","Move Left",() => { dotgrid.cursor.pos.x += 15; dotgrid.draw() },"Left");
    this.controller.add("default","Manual","Remove Point",() => { dotgrid.tool.remove_segments_at(dotgrid.cursor.pos); },"CmdOrCtrl+Backspace");

    this.controller.add("default","Layers","Foreground",() => { dotgrid.tool.select_layer(0) },"CmdOrCtrl+1");
    this.controller.add("default","Layers","Middleground",() => { dotgrid.tool.select_layer(1) },"CmdOrCtrl+2");
    this.controller.add("default","Layers","Background",() => { dotgrid.tool.select_layer(2) },"CmdOrCtrl+3");

    this.controller.add("default","View","Tools",() => { dotgrid.interface.toggle(); },"U");
    this.controller.add("default","View","Grid",() => { dotgrid.guide.toggle(); },"H");

    this.controller.add("default","Mode","Picker",() => { dotgrid.picker.start(); },"CmdOrCtrl+P");

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

  // File

  this.new = function()
  {
    this.set_size({width:300,height:300})
    this.history.push(this.tool.layers);
    this.clear();
  }

  this.save = function()
  {
    this.draw();

    var svg = dotgrid.svg_el.outerHTML;

    dialog.showSaveDialog((fileName) => {
      if (fileName === undefined){ return; }
      fs.writeFile(fileName+".svg", svg);
      fs.writeFile(fileName+'.png', dotgrid.render.buffer());
      fs.writeFile(fileName+'.grid', dotgrid.tool.export());
      dotgrid.draw()
    });
  }

  this.open = function()
  {
    var paths = dialog.showOpenDialog({properties: ['openFile'],filters:[{name:"Dotgrid Image",extensions:["dot","grid"]}]});

    if(!paths){ console.log("Nothing to load"); return; }

    fs.readFile(paths[0], 'utf-8', (err, data) => {
      if(err){ alert("An error ocurred reading the file :" + err.message); return; }
      dotgrid.tool.replace(JSON.parse(data.toString().trim()));
      dotgrid.draw();
    });
  }

  // Cursor

  this.mouse_down = function(e)
  {
    var o = e.target.getAttribute("ar");

    if(o){
      if(o == "line"){ this.tool.cast("line"); return; }
      if(o == "arc_c"){ this.tool.cast("arc_c"); return;}
      if(o == "arc_r"){ this.tool.cast("arc_r"); return; }
      if(o == "bezier"){ this.tool.cast("bezier"); return; }
      if(o == "close"){ this.tool.cast("close"); return; }

      if(o == "thickness"){ this.mod_thickness(); return; }
      if(o == "linecap"){ this.mod_linecap(); return; }
      if(o == "linejoin"){ this.mod_linejoin(); return; }
      if(o == "mirror"){ this.mod_mirror(); return; }
      if(o == "fill"){ this.mod_fill(); return; }
      if(o == "color"){ setTimeout(()=>{ this.picker.start(); }, 100); return; }
      if(o == "depth"){ this.tool.select_next_layer(); return; }

      e.preventDefault();
    }    

    var pos = this.position_in_grid({x:e.clientX+5,y:e.clientY-5}); 
    pos = this.position_on_grid(pos);

    if(e.altKey){ dotgrid.tool.remove_segments_at(pos); return; }
    
    if(dotgrid.tool.vertex_at(pos)){ 
      console.log("Begin translation"); dotgrid.cursor.translation = {from:pos,to:pos}; 
      if(e.shiftKey){ console.log("Begin translation(multi)"); dotgrid.cursor.multi = true; }
    }
  }

  this.mouse_move = function(e)
  {
    var pos = this.position_in_grid({x:e.clientX+5,y:e.clientY-5}); pos = this.position_on_grid(pos);

    this.cursor.pos = pos;
    this.cursor.updated = new Date().getTime();
    this.cursor.operation = e.target.getAttribute("ar");

    if(dotgrid.cursor.translation && (Math.abs(dotgrid.cursor.translation.from.x) != Math.abs(pos.x) || Math.abs(dotgrid.cursor.translation.from.y) != Math.abs(pos.y))){ dotgrid.cursor.translation.to = pos; }

    dotgrid.guide.refresh();
    e.preventDefault();
  }

  this.mouse_up = function(e)
  {
    if(e.target.getAttribute("ar")){ return } // If clicking on interface

    var pos = this.position_in_grid({x:e.clientX+5,y:e.clientY-5}); 
    pos = this.position_on_grid(pos);

    if(e.altKey || e.target.id != "guide"){ return; }

    if(pos.x > 0) { dotgrid.cursor.translation = null; return; }

    if(dotgrid.cursor.translation && (Math.abs(dotgrid.cursor.translation.from.x) != Math.abs(dotgrid.cursor.translation.to.x) || Math.abs(dotgrid.cursor.translation.from.y) != Math.abs(dotgrid.cursor.translation.to.y))){
      if(dotgrid.cursor.multi){
        dotgrid.tool.translate_multi(dotgrid.cursor.translation.from,dotgrid.cursor.translation.to);
      }
      else{
        dotgrid.tool.translate(dotgrid.cursor.translation.from,dotgrid.cursor.translation.to);  
      }
      dotgrid.cursor.translation = null;
      dotgrid.cursor.multi = null;
      this.draw();
      e.preventDefault();
      return;
    }

    this.tool.add_vertex({x:pos.x * -1,y:pos.y});
    dotgrid.cursor.translation = null;
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

  // Toggles

  this.mod_thickness = function(mod,step = false)
  {
    if(!mod){ mod = 1; this.tool.style().thickness = this.tool.style().thickness > 30 ? 1 : this.tool.style().thickness }

    if(step){
      this.tool.style().thickness = parseInt(this.tool.style().thickness/5) * 5;
    }

    this.tool.style().thickness = Math.max(this.tool.style().thickness+mod,0);
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

  this.mod_mirror = function()
  {
    this.tool.style().mirror_style += 1;
    this.tool.style().mirror_style = this.tool.style().mirror_style > 7 ? 0 : this.tool.style().mirror_style;
    this.draw();
  }

  this.mod_fill = function()
  {
    this.tool.style().fill = this.tool.style().fill == "none" ? this.tool.style().color : "none";
    this.draw();
  }

  // Basics
  
  this.set_size = function(size = {width:300,height:300},interface = true) 
  {
    size = { width:clamp(parseInt(size.width/15)*15,100,1000),height:clamp(parseInt(size.height/15)*15,100,1000)}

    var win = require('electron').remote.getCurrentWindow();
    win.setSize(size.width+100,size.height+100+(interface ? 10 : 0),true);
    
    this.tool.settings.size.width = size.width
    this.tool.settings.size.height = size.height

    this.grid_x = size.width/15
    this.grid_y = size.height/15
    this.svg_el.setAttribute("width",size.width+"px");
    this.svg_el.setAttribute("height",size.height+"px");

    this.grid_width = this.tool.settings.size.width/this.grid_x;
    this.grid_height = this.tool.settings.size.height/this.grid_y;

    dotgrid.guide.resize(size);
    this.interface.update();
    this.draw();
  }

  this.draw = function(exp = false)
  {
    var paths = this.tool.paths();
    var d = this.tool.path();

    this.layer_1.setAttribute("d",paths[0]);
    this.layer_2.setAttribute("d",paths[1]);
    this.layer_3.setAttribute("d",paths[2]);

    this.svg_el.style.width = this.tool.settings.size.width;
    this.svg_el.style.height = this.tool.settings.size.height;

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

    this.render.draw();
    this.interface.update();
    this.guide.refresh();
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

    if(!file.path || file.path.indexOf(".dot") < 0 && file.path.indexOf(".grid") < 0){ console.log("Dotgrid","Not a dot file"); return; }

    var reader = new FileReader();
    reader.onload = function(e){
      dotgrid.tool.replace(JSON.parse(e.target.result.toString().trim()));
      dotgrid.draw();
    };
    reader.readAsText(file);
  }

  this.copy = function(e)
  {
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
    if(is_json(data)){
      data = JSON.parse(data.trim());  
      dotgrid.tool.import(data);
    }
    
    this.draw();
  }

  // Normalizers

  this.position_in_grid = function(pos)
  {
    return {x:(window.innerWidth/2) - (this.tool.settings.size.width/2) - pos.x,y:pos.y - (30+10)}
  }

  this.position_on_grid = function(pos)
  {
    pos.y = pos.y - 7.5
    pos.x = pos.x + 7.5
    x = Math.round(pos.x/this.grid_width)*this.grid_width
    y = Math.round(pos.y/this.grid_height)*this.grid_height

    x = clamp(x * -1,0,this.tool.settings.size.width)
    y = clamp(y,0,this.tool.settings.size.height)
    return {x:x*-1,y:y};
  }

  function is_json(text){ try{ JSON.parse(text);return true; } catch(error){ return false; }}
  function pos_is_equal(a,b){ return a && b && a.x == b.x && a.y == b.y }
  function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }
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
