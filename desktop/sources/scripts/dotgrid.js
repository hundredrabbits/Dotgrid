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
  this.cursor = new Cursor();

  this.grid_x = grid_x;
  this.grid_y = grid_y;
  this.block_x = block_x;
  this.block_y = block_y;

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

    this.controller.add("default","Effect","Linecap",() => { dotgrid.tool.toggle("linecap"); },"Q");
    this.controller.add("default","Effect","Linejoin",() => { dotgrid.tool.toggle("linejoin"); },"W");
    this.controller.add("default","Effect","Mirror",() => { dotgrid.tool.toggle("mirror"); },"E");
    this.controller.add("default","Effect","Fill",() => { dotgrid.tool.toggle("fill"); },"R");
    this.controller.add("default","Effect","Color",() => { dotgrid.picker.start(); },"G");
    this.controller.add("default","Effect","Thicker",() => { dotgrid.tool.toggle("thickness",1) },"}");
    this.controller.add("default","Effect","Thinner",() => { dotgrid.tool.toggle("thickness",-1) },"{");
    this.controller.add("default","Effect","Thicker +5",() => { dotgrid.tool.toggle("thickness",5) },"]");
    this.controller.add("default","Effect","Thinner -5",() => { dotgrid.tool.toggle("thickness",-5) },"[");

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

    document.addEventListener('mousedown', function(e){ dotgrid.cursor.down(e); }, false);
    document.addEventListener('mousemove', function(e){ dotgrid.cursor.move(e); }, false);
    document.addEventListener('contextmenu', function(e){ dotgrid.cursor.alt(e); }, false);
    document.addEventListener('mouseup', function(e){ dotgrid.cursor.up(e);}, false);
    document.addEventListener('copy', function(e){ dotgrid.copy(e); }, false);
    document.addEventListener('cut', function(e){ dotgrid.cut(e); }, false);
    document.addEventListener('paste', function(e){ dotgrid.paste(e); }, false);
    window.addEventListener('drop', dotgrid.drag);

    this.new();
  }

  // File

  this.new = function()
  {
    this.set_zoom(1.0)
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
    dialog.showSaveDialog({
      title:"Save to .grid",
      filters: [{name: "Dotgrid", extensions: ["grid", "dot"]}]
    },(fileName) => {
      if (fileName === undefined){ return; }
      fileName = fileName.substr(-5,5) != ".grid" ? fileName+".grid" : fileName;
      fs.writeFileSync(fileName, content);
      this.guide.refresh()
    });
  }

  this.render = function(content = this.renderer.to_png({width:dotgrid.tool.settings.size.width*2,height:dotgrid.tool.settings.size.height*2}), ready = null, size = null)
  {
    if(!ready){return; }

    dialog.showSaveDialog({title:"Render to .png"},(fileName) => {
      if (fileName === undefined){ return; }
      fileName = fileName.substr(-4,4) != ".png" ? fileName+".png" : fileName;
      console.log(`Rendered ${size.width}x${size.height}`)
      fs.writeFileSync(fileName, ready);
    });
  }

  this.export = function(content = this.renderer.to_svg())
  {
    dialog.showSaveDialog({title:"Export to .svg"},(fileName) => {
      if (fileName === undefined){ return; }
      fileName = fileName.substr(-4,4) != ".svg" ? fileName+".svg" : fileName;
      fs.writeFileSync(fileName, content);
      this.guide.refresh()
    });
  }

  // Basics

  this.set_size = function(size = {width:300,height:300},interface = true,scale = 1)
  {
    size = { width:clamp(step(size.width,15),105,1080),height:clamp(step(size.height,15),120,1080)}

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

    if(e.target !== this.picker.el){
      e.clipboardData.setData('text/source', dotgrid.tool.export(dotgrid.tool.layer()));
      e.clipboardData.setData('text/plain', dotgrid.tool.path());
      e.clipboardData.setData('text/html', dotgrid.renderer.to_svg());
      e.clipboardData.setData('text/svg+xml', dotgrid.renderer.to_svg());
      e.preventDefault();
    }

    dotgrid.guide.refresh();
  }

  this.cut = function(e)
  {
    dotgrid.guide.refresh();

    if(e.target !== this.picker.el){
      e.clipboardData.setData('text/plain', dotgrid.tool.export(dotgrid.tool.layer()));
      e.clipboardData.setData('text/html', dotgrid.renderer.to_svg());
      e.clipboardData.setData('text/svg+xml', dotgrid.renderer.to_svg());
      dotgrid.tool.layers[dotgrid.tool.index] = [];
      e.preventDefault();
    }

    dotgrid.guide.refresh();
  }

  this.paste = function(e)
  {
    if(e.target !== this.picker.el){
      var data = e.clipboardData.getData("text/source");
      if (is_json(data)) {
        data = JSON.parse(data.trim());
        dotgrid.tool.import(data);
      }
      e.preventDefault();
    }

    dotgrid.guide.refresh();
  }
}

window.addEventListener('resize', function(e)
{
  var size = {width:step(window.innerWidth-90,15),height:step(window.innerHeight-120,15)}

  dotgrid.tool.settings.size.width = size.width
  dotgrid.tool.settings.size.height = size.height

  dotgrid.grid_x = size.width/15
  dotgrid.grid_y = size.height/15

  dotgrid.grid_width = dotgrid.tool.settings.size.width/dotgrid.grid_x;
  dotgrid.grid_height = dotgrid.tool.settings.size.height/dotgrid.grid_y;

  dotgrid.guide.resize(size);

  dotgrid.interface.refresh();
  dotgrid.guide.refresh();

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

function is_json(text){ try{ JSON.parse(text);return true; } catch(error){ return false; }}
function pos_is_equal(a,b){ return a && b && a.x == b.x && a.y == b.y }
function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }
function step(v,s){ return Math.round(v/s) * s; }
