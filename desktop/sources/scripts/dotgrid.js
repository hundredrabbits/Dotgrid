function Dotgrid(width,height,grid_x,grid_y,block_x,block_y)
{
  this.controller = new Controller();
  this.theme = new Theme();
  this.interface = new Interface();
  this.history = new History();
  this.guide = new Guide();
  this.renderer = new Renderer();
  this.tool = new Tool();
  this.picker = new Picker();

  this.grid_x = grid_x;
  this.grid_y = grid_y;
  this.block_x = block_x;
  this.block_y = block_y;

  this.cursor = { pos:{x:0,y:0},translation:null,multi:false,updated:0 }

  this.install = function()
  {  
    document.getElementById("app").appendChild(this.guide.el);

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
    this.controller.add("default","File","Save(.grid)",() => { dotgrid.save(); },"CmdOrCtrl+S");
    this.controller.add("default","File","Render(.png)",() => { dotgrid.render(); },"CmdOrCtrl+R");
    this.controller.add("default","File","Export(.svg)",() => { dotgrid.export(); },"CmdOrCtrl+E");
    this.controller.add("default","File","Build Icons",() => { dotgrid.build(); },"CmdOrCtrl+B");

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
    this.controller.add("default","Stroke","Close",() => { dotgrid.tool.cast("close") },"Z");

    this.controller.add("default","Effect","Linecap",() => { dotgrid.mod_linecap(); },"Q");
    this.controller.add("default","Effect","Linejoin",() => { dotgrid.mod_linejoin(); },"W");
    this.controller.add("default","Effect","Mirror",() => { dotgrid.tool.toggle_mirror(); },"E");
    this.controller.add("default","Effect","Fill",() => { dotgrid.mod_fill(); },"R");
    this.controller.add("default","Effect","Color",() => { dotgrid.picker.start(); },"G");
    this.controller.add("default","Effect","Thicker",() => { dotgrid.mod_thickness(1) },"}");
    this.controller.add("default","Effect","Thinner",() => { dotgrid.mod_thickness(-1) },"{");
    this.controller.add("default","Effect","Thicker +5",() => { dotgrid.mod_thickness(5,true) },"]");
    this.controller.add("default","Effect","Thinner -5",() => { dotgrid.mod_thickness(-5,true) },"[");

    this.controller.add("default","Manual","Add Point",() => { dotgrid.tool.add_vertex(dotgrid.cursor.pos); dotgrid.guide.refresh() },"Enter");
    this.controller.add("default","Manual","Move Up",() => { dotgrid.cursor.pos.y -= 15; dotgrid.guide.refresh() },"Up");
    this.controller.add("default","Manual","Move Right",() => { dotgrid.cursor.pos.x -= 15; dotgrid.guide.refresh() },"Right");
    this.controller.add("default","Manual","Move Down",() => { dotgrid.cursor.pos.y += 15; dotgrid.guide.refresh() },"Down");
    this.controller.add("default","Manual","Move Left",() => { dotgrid.cursor.pos.x += 15; dotgrid.guide.refresh() },"Left");
    this.controller.add("default","Manual","Remove Point",() => { dotgrid.tool.remove_segments_at(dotgrid.cursor.pos); },"CmdOrCtrl+Backspace");

    this.controller.add("default","Layers","Foreground",() => { dotgrid.tool.select_layer(0) },"CmdOrCtrl+1");
    this.controller.add("default","Layers","Middleground",() => { dotgrid.tool.select_layer(1) },"CmdOrCtrl+2");
    this.controller.add("default","Layers","Background",() => { dotgrid.tool.select_layer(2) },"CmdOrCtrl+3");

    this.controller.add("default","View","Tools",() => { dotgrid.interface.toggle(); },"U");
    this.controller.add("default","View","Grid",() => { dotgrid.guide.toggle(); },"H");
    this.controller.add("default","View","Zoom Reset",() => { dotgrid.set_zoom(1.0) },"-");
    this.controller.add("default","View","Zoom 150%",() => { dotgrid.set_zoom(1.5) },"Plus");

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

  this.open = function()
  {
    var paths = dialog.showOpenDialog({properties: ['openFile'],filters:[{name:"Dotgrid Image",extensions:["dot","grid"]}]});

    if(!paths){ console.log("Nothing to load"); return; }

    fs.readFile(paths[0], 'utf-8', (err, data) => {
      if(err){ alert("An error ocurred reading the file :" + err.message); return; }
      this.tool.replace(JSON.parse(data.toString().trim()));
      this.guide.refresh();
    });
  }

  this.save = function(content = this.tool.export())
  {
    dialog.showSaveDialog({title:"Save to .grid"},(fileName) => {
      if (fileName === undefined){ return; }
      fs.writeFileSync(fileName+'.grid', content);
      this.guide.refresh()
    });
  }

  this.render = function(content = this.renderer.to_png(), ready = null, size = null)
  {
    if(!ready){return; }

    dialog.showSaveDialog({title:"Render to .png"},(fileName) => {
      if (fileName === undefined){ return; }
      console.log(`Rendered ${size.width}x${size.height}`)
      fs.writeFileSync(fileName+'.png', ready);
    });
  }

  this.export = function(content = this.renderer.to_svg())
  {
    dialog.showSaveDialog({title:"Export to .svg"},(fileName) => {
      if (fileName === undefined){ return; }
      fs.writeFileSync(fileName+".svg", content);
      this.guide.refresh()
    });
  }

  this.bundle = {}

  this.build = function()
  {
    this.bundle = {}

    var sizes = [
      {width:16,height:16},
      {width:32,height:32},
      {width:52,height:52},
      {width:64,height:64},
      {width:72,height:72},
      {width:96,height:96},
      {width:128,height:128},
      {width:256,height:256},
      {width:512,height:512}
    ]

    for(id in sizes){
      this.renderer.to_png(sizes[id],dotgrid.package)
    }
  }

  this.package = function(n = null, ready,size)
  {
    dotgrid.bundle[`${size.width}x${size.height}`] = ready

    console.log(`Rendered ${size.width}x${size.height}`,`${Object.keys(dotgrid.bundle).length}/9`)

    if(Object.keys(dotgrid.bundle).length == 9){
      dialog.showSaveDialog({title:"Export to Icons"},(fileName) => {
        if (fileName === undefined){ return; }
        for(id in dotgrid.bundle){
          fs.writeFileSync(`${fileName}.${id}.png`, dotgrid.bundle[id]);
        }
      });
    }
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

      if(o == "thickness"){ this.mod_thickness(10,true,true); return; }
      if(o == "linecap"){ this.mod_linecap(); return; }
      if(o == "linejoin"){ this.mod_linejoin(); return; }
      if(o == "mirror"){ this.tool.toggle_mirror(); return; }
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

    dotgrid.guide.refresh();
    dotgrid.interface.refresh();
  }

  this.mouse_move = function(e)
  {
    var pos = this.position_in_grid({x:e.clientX+5,y:e.clientY-5}); pos = this.position_on_grid(pos);

    this.cursor.pos = pos;
    this.cursor.updated = new Date().getTime();
    this.cursor.operation = e.target.getAttribute("ar");

    if(dotgrid.cursor.translation && (Math.abs(dotgrid.cursor.translation.from.x) != Math.abs(pos.x) || Math.abs(dotgrid.cursor.translation.from.y) != Math.abs(pos.y))){ dotgrid.cursor.translation.to = pos; }

    dotgrid.guide.refresh();
    dotgrid.interface.refresh();
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
      dotgrid.guide.refresh();
      e.preventDefault();
      return;
    }

    this.tool.add_vertex({x:pos.x * -1,y:pos.y});
    dotgrid.cursor.translation = null;

    dotgrid.interface.refresh();
    dotgrid.guide.refresh();

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

  this.mod_thickness = function(mod = 10,step = false,cap = false)
  {
    if(cap){ 
      this.tool.style().thickness = this.tool.style().thickness > 40 ? 1 : this.tool.style().thickness 
    }
    if(step){
      this.tool.style().thickness = parseInt(this.tool.style().thickness/5) * 5;
    }

    this.tool.style().thickness = clamp(this.tool.style().thickness+mod,1,40);
    dotgrid.guide.refresh();
  }

  this.mod_linecap_index = 1;

  this.mod_linecap = function(mod)
  {
    var a = ["butt","square","round"];
    this.mod_linecap_index += 1;
    this.tool.style().strokeLinecap = a[this.mod_linecap_index % a.length];
    dotgrid.guide.refresh();
  }

  this.mod_linejoin_index = 1;

  this.mod_linejoin = function(mod)
  {
    var a = ["miter","round","bevel"];
    this.mod_linejoin_index += 1;
    this.tool.style().strokeLinejoin = a[this.mod_linejoin_index % a.length];
    dotgrid.guide.refresh();
  }

  this.mod_fill = function()
  {
    this.tool.style().fill = this.tool.style().fill == "none" ? this.tool.style().color : "none";
    dotgrid.guide.refresh();
  }

  // Basics
  
  this.set_size = function(size = {width:300,height:300},interface = true,scale = 1) 
  {
    size = { width:clamp(parseInt(size.width/15)*15,120,1000),height:clamp(parseInt(size.height/15)*15,120,1000)}

    this.tool.settings.size.width = size.width
    this.tool.settings.size.height = size.height

    var win = require('electron').remote.getCurrentWindow();
    win.setSize((size.width+100)*scale,(size.height+100+(interface ? 10 : 0))*scale,true);
    
    this.grid_x = size.width/15
    this.grid_y = size.height/15

    this.grid_width = this.tool.settings.size.width/this.grid_x;
    this.grid_height = this.tool.settings.size.height/this.grid_y;

    dotgrid.guide.resize(size);

    this.interface.refresh();
    dotgrid.guide.refresh();
  }

  this.set_zoom = function(scale)
  {
    this.set_size({width:this.tool.settings.size.width,height:this.tool.settings.size.height},true,scale)
    webFrame.setZoomFactor(scale)
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
    dotgrid.guide.refresh();
    dotgrid.interface.refresh(true);
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
      dotgrid.guide.refresh();
    };
    reader.readAsText(file);
  }

  this.copy = function(e)
  {
    dotgrid.guide.refresh();

    e.clipboardData.setData('text/source', dotgrid.tool.export(dotgrid.tool.layer()));
    e.clipboardData.setData('text/plain', dotgrid.tool.path());
    e.clipboardData.setData('text/html', dotgrid.renderer.to_svg());
    e.clipboardData.setData('text/svg+xml', dotgrid.renderer.to_svg());

    dotgrid.guide.refresh();
  }

  this.cut = function(e)
  {
    dotgrid.guide.refresh();

    e.clipboardData.setData('text/plain', dotgrid.tool.export(dotgrid.tool.layer()));
    e.clipboardData.setData('text/html', dotgrid.renderer.to_svg());
    e.clipboardData.setData('text/svg+xml', dotgrid.renderer.to_svg());

    dotgrid.tool.layers[dotgrid.tool.index] = [];

    dotgrid.guide.refresh();
  }

  this.paste = function(e)
  {
    var data = e.clipboardData.getData("text/source");
    if(is_json(data)){
      data = JSON.parse(data.trim());  
      dotgrid.tool.import(data);
    }
    
    dotgrid.guide.refresh();
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
  dotgrid.guide.refresh()
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
