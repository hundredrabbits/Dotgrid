function Tool()
{
  this.index = 0;
  this.settings = { size:{width:300,height:300} }
  this.layers = [[],[],[]];
  this.styles = [
    { thickness:2,strokeLinecap:"round",strokeLinejoin:"round",color:"#f00",fill:"none",mirror_style:0 },
    { thickness:2,strokeLinecap:"round",strokeLinejoin:"round",color:"#0f0",fill:"none",mirror_style:0 },
    { thickness:2,strokeLinecap:"round",strokeLinejoin:"round",color:"#00f",fill:"none",mirror_style:0 }
  ];
  this.verteces = [];
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
    this.verteces = [];
    this.index = 0;
    dotgrid.set_size({width:300,height:300})
  }

  this.clear = function()
  {
    this.verteces = [];
    dotgrid.preview();
    dotgrid.draw();
  }

  this.undo = function()
  {
    this.layers = dotgrid.history.prev();
    dotgrid.draw();
  }

  this.redo = function()
  {
    this.layers = dotgrid.history.next();
    dotgrid.draw();    
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
    dotgrid.draw();
  }
  
  this.replace = function(dot)
  {
    if(!dot.layers || dot.layers.length != 3){ console.log("Incompatible version"); return; }
    
    if(this.settings && (this.settings.size.width != dot.settings.size.width || this.settings.size.height != dot.settings.size.height)){
      dotgrid.set_size({width:dot.settings.size.width,height:dot.settings.size.height})
    }

    this.layers = dot.layers;
    this.styles = dot.styles;
    this.settings = dot.settings;

    this.clear();
    dotgrid.draw();
    dotgrid.history.push(this.layers);
  }

  // EDIT
  
  this.remove_segment = function()
  {
    if(this.verteces.length > 0){ this.clear(); return; }
    
    this.layer().pop();
    this.clear();
    dotgrid.draw();
  }

  this.remove_segments_at = function(pos)
  {
    for(segment_id in this.layer()){
      var segment = this.layer()[segment_id];
      for(vertex_id in segment.verteces){
        var vertex = segment.verteces[vertex_id];
        if(Math.abs(pos.x) == Math.abs(vertex.x) && Math.abs(pos.y) == Math.abs(vertex.y)){
          segment.verteces.splice(vertex_id,1)
        }
      }
      if(segment.verteces.length < 2){
        this.layers[this.index].splice(segment_id,1)
      }
    }
    this.clear();
    dotgrid.draw();
  }

  this.add_vertex = function(pos)
  {
    pos = {x:Math.abs(pos.x),y:Math.abs(pos.y)}
    this.verteces.push(pos);
  }

  this.vertex_at = function(pos)
  {
    for(segment_id in this.layer()){
      var segment = this.layer()[segment_id];
      for(vertex_id in segment.verteces){
        var vertex = segment.verteces[vertex_id];
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

    var append_target = this.can_append({type:type,verteces:this.verteces.slice()})

    if(append_target){
      this.layers[this.index][append_target].verteces = this.layers[this.index][append_target].verteces.concat(this.verteces.slice())
    }
    else{
      this.layer().push({type:type,verteces:this.verteces.slice()})  
    }
    
    this.clear();
    dotgrid.draw();
    dotgrid.history.push(this.layers);

    console.log(`Casted ${type} -> ${this.layer().length} elements`);
  }

  this.can_append = function(content)
  {
    for(id in this.layer()){
      var stroke = this.layer()[id];
      if(stroke.type != content.type){ continue; }
      if(!stroke.verteces[stroke.verteces.length-1]){ continue; }
      if(stroke.verteces[stroke.verteces.length-1].x != content.verteces[0].x){ continue; }
      if(stroke.verteces[stroke.verteces.length-1].y != content.verteces[0].y){ continue; }
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
    return this.verteces.length >= this.reqs[type];
  }

  this.path = function(layer_id = 0, preview = null)
  {
    var layer = preview ? preview : this.layers[layer_id];

    var html = "";
    for(id in layer){
      var segment = layer[id];
      html += segment.type == "close" ? "Z " : this.render(segment,0);

      // Horizontal Mirror
      if(this.styles[layer_id].mirror_style == 1){
        html += segment.type == "close" ? "Z " : this.render(segment,0,true,false);
      }
      // Vertical Mirror
      if(this.styles[layer_id].mirror_style == 2){
        html += segment.type == "close" ? "Z " : this.render(segment,0,false,true);
      }
      // Single-fold
      if(this.styles[layer_id].mirror_style == 3){
        html += segment.type == "close" ? "Z " : this.render(segment,180,false,false);
      }
      // Three-fold
      if(this.styles[layer_id].mirror_style == 4){
        html += segment.type == "close" ? "Z " : this.render(segment,120,false,false);
        html += segment.type == "close" ? "Z " : this.render(segment,240,false,false);
      }
      // Four-fold
      if(this.styles[layer_id].mirror_style == 5){
        html += segment.type == "close" ? "Z " : this.render(segment,90,false,false);
        html += segment.type == "close" ? "Z " : this.render(segment,180,false,false);
        html += segment.type == "close" ? "Z " : this.render(segment,270,false,false);
      }
      // Five-folds
      if(this.styles[layer_id].mirror_style == 6){
        html += segment.type == "close" ? "Z " : this.render(segment,72,false,false);
        html += segment.type == "close" ? "Z " : this.render(segment,72*2,false,false);
        html += segment.type == "close" ? "Z " : this.render(segment,72*3,false,false);
        html += segment.type == "close" ? "Z " : this.render(segment,72*4,false,false);
      }
      // Six-folds
      if(this.styles[layer_id].mirror_style == 7){
        html += segment.type == "close" ? "Z " : this.render(segment,60,false,false);
        html += segment.type == "close" ? "Z " : this.render(segment,60*2,false,false);
        html += segment.type == "close" ? "Z " : this.render(segment,60*3,false,false);
        html += segment.type == "close" ? "Z " : this.render(segment,60*4,false,false);
        html += segment.type == "close" ? "Z " : this.render(segment,60*5,false,false);
      }
    }
    return html
  }

  this.paths = function()
  {
    return [this.path(0),this.path(1),this.path(2)]
  }

  this.render = function(segment, angle = 0, mirror_x = false, mirror_y = false)
  {
    var type = segment.type;
    var verteces = segment.verteces;
    var html = ``;
    var skip = 0;

    for(id in verteces){
      if(skip > 0){ skip -= 1; continue; }
      
      var vertex = this.mirror_mod(verteces[id],angle,mirror_x,mirror_y);
      var next = this.mirror_mod(verteces[parseInt(id)+1],angle,mirror_x,mirror_y)
      var after_next = this.mirror_mod(verteces[parseInt(id)+2],angle,mirror_x,mirror_y)

      if(id == 0){ 
        html += `M${vertex.x},${vertex.y} `;
      }

      if(type == "line"){
        html += `L${vertex.x},${vertex.y} `;  
      }
      else if(type == "arc_c" && next){
        html += `A${next.x - vertex.x},${next.y - vertex.y} 0 0,1 ${next.x},${next.y} `;  
      }
      else if(type == "arc_r" && next){
        html += `A${next.x - vertex.x},${next.y - vertex.y} 0 0,0 ${next.x},${next.y} `;
      }
      else if(type == "bezier" && next && after_next){
        html += `Q${next.x},${next.y} ${after_next.x},${after_next.y} `;  
        skip = 1
      }
    }
  
    return html
  }

  this.mirror_mod = function(vertex,angle = 0,mirror_x = false,mirror_y = false)
  {
    if(!vertex){ return null; }

    if(mirror_x == true){
      return {x:(dotgrid.tool.settings.size.width - vertex.x),y:vertex.y}
    }
    if(mirror_y == true){
      return {x:vertex.x,y:(dotgrid.tool.settings.size.height - vertex.y)+(dotgrid.height/2)}
    }
    if(angle == 0){
      return vertex;
    }
    return rotate_point(vertex.x,vertex.y,dotgrid.tool.settings.size.width/2,dotgrid.tool.settings.size.height/2,angle)
  }

  this.translate = function(a,b)
  {
    for(segment_id in this.layer()){
      var segment = this.layer()[segment_id];
      for(vertex_id in segment.verteces){
        var vertex = segment.verteces[vertex_id];
        if(vertex.x == Math.abs(a.x) && vertex.y == Math.abs(a.y)){
          segment.verteces[vertex_id] = {x:Math.abs(b.x),y:Math.abs(b.y)};
        }
      }
    }
    dotgrid.history.push(this.layers);
    this.clear();
    dotgrid.draw();
  }

  this.translate_multi = function(a,b)
  {
    var offset = {x:a.x - b.x,y:a.y - b.y}

    for(segment_id in this.layer()){
      var segment = this.layer()[segment_id];
      for(vertex_id in segment.verteces){
        var vertex = segment.verteces[vertex_id];
        segment.verteces[vertex_id] = {x:vertex.x+offset.x,y:vertex.y-offset.y};
      }
    }
    dotgrid.history.push(this.layers);
    this.clear();
    dotgrid.draw();
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
    dotgrid.draw();
    console.log(`layer:${this.index}`)
  }

  this.select_next_layer = function()
  {
    this.index = this.index >= 2 ? 0 : this.index+1
    this.select_layer(this.index);
  }

  function rotate_point(pointX, pointY, originX, originY, angle){ angle = angle * Math.PI / 180.0; return { x: (Math.cos(angle) * (pointX-originX) - Math.sin(angle) * (pointY-originY) + originX).toFixed(1), y: (Math.sin(angle) * (pointX-originX) + Math.cos(angle) * (pointY-originY) + originY).toFixed(1) }; }
  function copy(data){ return data ? JSON.parse(JSON.stringify(data)) : []; }
  function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }
}