function Tool()
{
  this.index = 0;
  this.settings = { size:{width:300,height:300} }
  this.layers = [[],[],[]];
  this.styles = [
    { thickness:10,strokeLinecap:"round",strokeLinejoin:"round",color:"#f00",fill:"none",mirror_style:0 },
    { thickness:10,strokeLinecap:"round",strokeLinejoin:"round",color:"#0f0",fill:"none",mirror_style:0 },
    { thickness:10,strokeLinecap:"round",strokeLinejoin:"round",color:"#00f",fill:"none",mirror_style:0 }
  ];
  this.vertices = [];
  this.reqs = { line:2,arc_c:2,arc_r:2,bezier:3,close:0 };

  this.start = function()
  {
    this.styles[0].color = dotgrid.theme.active.f_high
    this.styles[1].color = dotgrid.theme.active.f_med
    this.styles[2].color = dotgrid.theme.active.f_low
  }

  this.reset = function()
  {
    this.layers = [[],[],[]];
    this.vertices = [];
    this.index = 0;
  }

  this.clear = function()
  {
    this.vertices = [];
    dotgrid.guide.refresh();
    dotgrid.interface.refresh(true);
  }

  this.undo = function()
  {
    this.layers = dotgrid.history.prev();
    dotgrid.guide.refresh();
    dotgrid.interface.refresh(true);
  }

  this.redo = function()
  {
    this.layers = dotgrid.history.next();
    dotgrid.guide.refresh();    
    dotgrid.interface.refresh(true);
  }

  // I/O

  this.export = function(target = {settings:this.settings,layers:this.layers,styles:this.styles})
  {
    return JSON.stringify(copy(target), null, 2);
  }

  this.import = function(layer)
  {
    this.layers[this.index] = this.layers[this.index].concat(layer)
    dotgrid.history.push(this.layers);
    this.clear();
    dotgrid.guide.refresh();
    dotgrid.interface.refresh(true);
  }
  
  this.replace = function(dot)
  {
    if(!dot.layers || dot.layers.length != 3){ console.warn("Incompatible version"); return; }

    if(dot.settings.width && dot.settings.height){
      dot.settings.size = {width:dot.settings.width,height:dot.settings.height}
    }
    if(this.settings && (this.settings.size.width != dot.settings.size.width || this.settings.size.height != dot.settings.size.height)){
      dotgrid.set_size({width:dot.settings.size.width,height:dot.settings.size.height})
    }

    this.layers = dot.layers;
    this.styles = dot.styles;
    this.settings = dot.settings;

    this.clear();
    dotgrid.guide.refresh();
    dotgrid.interface.refresh(true);
    dotgrid.history.push(this.layers);
  }

  // EDIT
  
  this.remove_segment = function()
  {
    if(this.vertices.length > 0){ this.clear(); return; }
    
    this.layer().pop();
    this.clear();
    dotgrid.guide.refresh();
    dotgrid.interface.refresh(true);
  }

  this.remove_segments_at = function(pos)
  {
    for(segment_id in this.layer()){
      var segment = this.layer()[segment_id];
      for(vertex_id in segment.vertices){
        var vertex = segment.vertices[vertex_id];
        if(Math.abs(pos.x) == Math.abs(vertex.x) && Math.abs(pos.y) == Math.abs(vertex.y)){
          segment.vertices.splice(vertex_id,1)
        }
      }
      if(segment.vertices.length < 2){
        this.layers[this.index].splice(segment_id,1)
      }
    }
    this.clear();
    dotgrid.guide.refresh();
    dotgrid.interface.refresh(true);
  }

  this.add_vertex = function(pos)
  {
    pos = {x:Math.abs(pos.x),y:Math.abs(pos.y)}
    this.vertices.push(pos);
    dotgrid.interface.refresh(true);
  }

  this.vertex_at = function(pos)
  {
    for(segment_id in this.layer()){
      var segment = this.layer()[segment_id];
      for(vertex_id in segment.vertices){
        var vertex = segment.vertices[vertex_id];
        if(vertex.x == Math.abs(pos.x) && vertex.y == Math.abs(pos.y)){
          return vertex;
        }
      }
    }
    return null;
  }

  this.cast = function(type)
  {
    if(!this.layer()){ this.layers[this.index] = []; }
    if(!this.can_cast(type)){ console.warn("Cannot cast"); return; }

    var append_target = this.can_append({type:type,vertices:this.vertices.slice()})

    if(append_target){
      this.layers[this.index][append_target].vertices = this.layers[this.index][append_target].vertices.concat(this.vertices.slice())
    }
    else{
      this.layer().push({type:type,vertices:this.vertices.slice()})  
    }

    dotgrid.history.push(this.layers);

    this.clear();
    dotgrid.guide.refresh();
    dotgrid.interface.refresh(true);

    console.log(`Casted ${type} -> ${this.layer().length} elements`);
  }

  this.i = { linecap:0,linejoin:0,thickness:5 }

  this.toggle = function(type,mod = 1)
  {
    if(type == "linecap"){
      var a = ["butt","square","round"];
      this.i.linecap += mod;
      this.style().strokeLinecap = a[this.i.linecap % a.length];
    }
    else if(type == "linejoin"){
      var a = ["miter","round","bevel"];
      this.i.linejoin += mod;
      this.style().strokeLinejoin = a[this.i.linejoin % a.length];
    }
    else if(type == "fill"){
      this.style().fill = this.style().fill == "none" ? this.style().color : "none";
    }
    else if(type == "thickness"){
      this.style().thickness = clamp(this.style().thickness+mod,1,100);
    }
    else if(type == "mirror"){
      this.style().mirror_style = this.style().mirror_style > 3 ? 0 : this.style().mirror_style+1;
    }
    else{
      console.warn("Unknown",type)
    }
    dotgrid.interface.refresh(true);
    dotgrid.guide.refresh();
  }

  this.misc = function(type)
  {
    dotgrid.picker.start();
  }

  this.can_append = function(content)
  {
    for(id in this.layer()){
      var stroke = this.layer()[id];
      if(stroke.type != content.type){ continue; }
      if(!stroke.vertices){ continue; }
      if(!stroke.vertices[stroke.vertices.length-1]){ continue; }
      if(stroke.vertices[stroke.vertices.length-1].x != content.vertices[0].x){ continue; }
      if(stroke.vertices[stroke.vertices.length-1].y != content.vertices[0].y){ continue; }
      return id;
    }
    return false;
  }

  this.can_cast = function(type)
  {
    if(!type){ return false; }
    // Cannot cast close twice
    if(type == "close"){
      var prev = this.layer()[this.layer().length-1];
      if(!prev || prev.type == "close"){
        return false;
      }
    }
    if(type == "bezier"){
      if(this.vertices.length != 3 && this.vertices.length != 5 && this.vertices.length != 7 && this.vertices.length != 9){
        return false;
      }
    }
    return this.vertices.length >= this.reqs[type];
  }

  this.paths = function()
  {
    var l1 = new Generator(dotgrid.tool.layers[0],dotgrid.tool.styles[0]).toString({x:-10,y:-10},1)
    var l2 = new Generator(dotgrid.tool.layers[1],dotgrid.tool.styles[1]).toString({x:-10,y:-10},1)
    var l3 = new Generator(dotgrid.tool.layers[2],dotgrid.tool.styles[2]).toString({x:-10,y:-10},1)

    return [l1,l2,l3]
  }

  this.path = function()
  {
    return new Generator(dotgrid.tool.layer(),dotgrid.tool.style()).toString({x:-10,y:-10},1)
  }

  this.translate = function(a,b)
  {
    for(segment_id in this.layer()){
      var segment = this.layer()[segment_id];
      for(vertex_id in segment.vertices){
        var vertex = segment.vertices[vertex_id];
        if(vertex.x == Math.abs(a.x) && vertex.y == Math.abs(a.y)){
          segment.vertices[vertex_id] = {x:Math.abs(b.x),y:Math.abs(b.y)};
        }
      }
    }
    dotgrid.history.push(this.layers);
    this.clear();
    dotgrid.guide.refresh();
  }

  this.translate_multi = function(a,b)
  {
    var offset = {x:a.x - b.x,y:a.y - b.y}

    for(segment_id in this.layer()){
      var segment = this.layer()[segment_id];
      for(vertex_id in segment.vertices){
        var vertex = segment.vertices[vertex_id];
        segment.vertices[vertex_id] = {x:vertex.x+offset.x,y:vertex.y-offset.y};
      }
    }
    dotgrid.history.push(this.layers);
    this.clear();
    dotgrid.guide.refresh();
  }

  // Style

  this.style = function()
  {
    if(!this.styles[this.index]){
      this.styles[this.index] = [];
    }
    return this.styles[this.index];    
  }

  // Layers

  this.layer = function()
  {
    if(!this.layers[this.index]){
      this.layers[this.index] = [];
    }
    return this.layers[this.index];
  }

  this.select_layer = function(id)
  {
    this.index = clamp(id,0,2);
    this.clear();
    dotgrid.guide.refresh();
    dotgrid.interface.refresh(true);
    console.log(`layer:${this.index}`)
  }

  this.select_next_layer = function()
  {
    this.index = this.index >= 2 ? 0 : this.index+1
    this.select_layer(this.index);
  }

  function copy(data){ return data ? JSON.parse(JSON.stringify(data)) : []; }
  function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }
}
