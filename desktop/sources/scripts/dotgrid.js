'use strict';

function Dotgrid(width,height,grid_x,grid_y,block_x,block_y)
{
  this.controller = null;
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
    if(!dialog){ return; }

    let paths = dialog.showOpenDialog({properties: ['openFile'],filters:[{name:"Dotgrid Image",extensions:["dot","grid"]}]});

    if(!paths){ console.log("Nothing to load"); return; }

    fs.readFile(paths[0], 'utf-8', (err, data) => {
      if(err){ alert("An error ocurred reading the file :" + err.message); return; }
      this.tool.replace(JSON.parse(data.toString().trim()));
      this.guide.refresh();
    });
  }

  this.save = function(content = this.tool.export())
  {
    if(dotgrid.tool.length() < 1){ console.log("Nothing to save"); return; }

    if(!dialog){ this.save_web(content); return; }

    dialog.showSaveDialog({title:"Save to .grid",filters: [{name: "Dotgrid Format", extensions: ["grid", "dot"]}]},(fileName) => {
      if (fileName === undefined){ return; }
      fileName = fileName.substr(-5,5) != ".grid" ? fileName+".grid" : fileName;
      fs.writeFileSync(fileName, content);
      dotgrid.guide.refresh()
    });
  }

  this.save_web = function(content)
  {
    console.info("Web Save");
    let win = window.open("", "Save", `toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=640,height=480,top=${screen.height-200},left=${screen.width-640}`);
    win.document.body.innerHTML = `<style>body { background:${dotgrid.theme.active.background}; color:${dotgrid.theme.active.f_med}} pre { color:${dotgrid.theme.active.f_high} }</style><p>To save: Copy this into a .grid file.<br />To load: Drag the .grid onto the browser window.</p><pre>${content}</pre>`;
  }

  this.render = function(content = this.renderer.to_png({width:dotgrid.tool.settings.size.width*2,height:dotgrid.tool.settings.size.height*2}), ready = null, size = null)
  {
    if(!ready){return; }
    if(dotgrid.tool.length() < 1){ console.log("Nothing to render"); return; }

    if(!dialog){ dotgrid.render_web(content); return; }

    dialog.showSaveDialog({title:"Save to .png",filters: [{name: "Image Format", extensions: ["png"]}]},(fileName) => {
      if (fileName === undefined){ return; }
      fileName = fileName.substr(-4,4) != ".png" ? fileName+".png" : fileName;
      console.log(`Rendered ${size.width}x${size.height}`)
      fs.writeFileSync(fileName, ready);
    });
  }

  this.render_web = function(content,window)
  {
    // Handled in Renderer
    console.info("Web Render");
  }

  this.export = function(content = this.renderer.to_svg())
  {
    if(dotgrid.tool.length() < 1){ console.log("Nothing to export"); return; }

    if(!dialog){ this.export_web(content); return; }

    dialog.showSaveDialog({title:"Save to .svg",filters: [{name: "Vector Format", extensions: ["svg"]}]},(fileName) => {
      if (fileName === undefined){ return; }
      fileName = fileName.substr(-4,4) != ".svg" ? fileName+".svg" : fileName;
      fs.writeFileSync(fileName, content);
      this.guide.refresh()
    });
  }

  this.export_web = function(content)
  {
    console.info("Web Export");
    let win = window.open("", "Save", `toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=640,height=480,top=${screen.height-200},left=${screen.width-640}`);
    win.document.body.innerHTML = `<style>body { background:${dotgrid.theme.active.background}}</style>${dotgrid.renderer.to_svg()}`;
  }

  // Basics

  this.set_size = function(size = {width:300,height:300},ui = true,scale = 1)
  {
    size = { width:clamp(step(size.width,15),105,1080),height:clamp(step(size.height,15),120,1080)}

    this.tool.settings.size.width = size.width
    this.tool.settings.size.height = size.height

    try{
      let win = require('electron').remote.getCurrentWindow();
      win.setSize((size.width+100)*scale,(size.height+100+(ui ? 10 : 0))*scale,true);  
    }
    catch(err){
      console.log("No window")
    }
    
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

    try{
      webFrame.setZoomFactor(scale)  
    }
    catch(err){
      console.log("Cannot zoom")
    }
  }

  // Draw

  this.reset = function()
  {
    this.tool.clear();
    this.refresh();
  }

  this.clear = function()
  {
    this.history.clear();
    this.tool.reset();
    this.reset();
    dotgrid.guide.refresh();
    dotgrid.interface.refresh(true);
  }

  this.refresh = function()
  {
    let size = {width:step(window.innerWidth-90,15),height:step(window.innerHeight-120,15)}

    dotgrid.tool.settings.size.width = size.width
    dotgrid.tool.settings.size.height = size.height

    dotgrid.grid_x = size.width/15
    dotgrid.grid_y = size.height/15

    dotgrid.grid_width = dotgrid.tool.settings.size.width/dotgrid.grid_x;
    dotgrid.grid_height = dotgrid.tool.settings.size.height/dotgrid.grid_y;

    dotgrid.guide.resize(size);

    dotgrid.interface.refresh();
    dotgrid.guide.refresh();
    document.title = `Dotgrid — ${size.width}x${size.height}`
  }

  this.drag = function(e)
  {
    e.preventDefault();
    e.stopPropagation();

    let file = e.dataTransfer.files[0];

    if(!file.path || file.path.indexOf(".dot") < 0 && file.path.indexOf(".grid") < 0){ console.log("Dotgrid","Not a dot file"); return; }

    let reader = new FileReader();
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
      let data = e.clipboardData.getData("text/source");
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
  dotgrid.refresh();
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
