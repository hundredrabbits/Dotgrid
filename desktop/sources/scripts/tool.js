function Tool()
{
  this.index = 0;
  this.layers = [[],[],[]];
  this.verteces = [];
  this.reqs = {line:2,arc_c:2,arc_r:2,bezier:3,close:0};

  this.reset = function()
  {
    this.layers = [[],[],[]];
    this.verteces = [];
    this.index = 0;
  }

  this.layer = function()
  {
    if(!this.layers[this.index]){
      this.layers[this.index] = [];
    }
    return this.layers[this.index];
  }

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

  this.path = function(layer = this.layer())
  {
    if(layer.length > 0 && layer[0].type == "close"){ return ""; }
    
    var html = "";
    for(id in layer){
      var segment = layer[id];
      html += segment.type == "close" ? "Z " : this.render(segment);
    }
    return html
  }

  this.paths = function()
  {
    return [this.path(this.layers[0]),this.path(this.layers[1]),this.path(this.layers[2])]
  }

  this.render = function(segment)
  {
    var type = segment.type;
    var verteces = segment.verteces;
    var html = ``;
    var skip = 0;

    for(id in verteces){
      if(skip > 0){ skip -= 1; continue; }
      if(id == 0){ html += `M${verteces[id].x},${verteces[id].y} `; }
      var vertex = verteces[id];
      var next = verteces[parseInt(id)+1]
      var after_next = verteces[parseInt(id)+2]

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

  this.clear = function()
  {
    this.verteces = [];
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

  this.export = function(target = this.layers)
  {
    return JSON.stringify(copy(target), null, 2);
  }

  this.replace = function(layers)
  {
    if(layers.length != 3){ console.log("Incompatible"); return; }
    
    this.layers = layers;
    this.clear();
    dotgrid.draw();
    dotgrid.history.push(this.layers);
  }

  this.import = function(layer)
  {
    this.layers[this.index] = this.layers[this.index].concat(layer)
    dotgrid.history.push(this.layers);
    this.clear();
    dotgrid.draw();
  }

  this.select_layer = function(id)
  {
    this.index = clamp(id,0,2);
    this.clear();
    dotgrid.draw();
    console.log(`layer:${this.index}`)
  }

  this.layer_up = function()
  {
    this.select_layer(this.index-1);
  }

  this.layer_down = function()
  {
    this.select_layer(this.index+1);
  }

  function copy(data){ return data ? JSON.parse(JSON.stringify(data)) : []; }
  function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }
}