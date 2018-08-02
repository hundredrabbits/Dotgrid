function Dotgrid(width,height,grid_x,grid_y,block_x,block_y)
{
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

    document.addEventListener('mousedown', function(e){ dotgrid.mouse_down(e); }, false);
    document.addEventListener('mousemove', function(e){ dotgrid.mouse_move(e); }, false);
    document.addEventListener('contextmenu', function(e){ dotgrid.mouse_alt(e); }, false);
    document.addEventListener('mouseup', function(e){ dotgrid.mouse_up(e);}, false);
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
    // webFrame.setZoomFactor(scale)
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

  // Normalizers

  this.position_in_grid = function(pos)
  {
    return {x:(window.innerWidth/2) - (this.tool.settings.size.width/2) - pos.x - 5,y:pos.y - (30+5)}
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
function step(v,s){ return parseInt(v/s) * s; }
