function Tool()
{
  this.index = 0;
  this.layers = [];
  this.verteces = [];
  this.reqs = {line:2,arc_c:2,arc_r:2,bezier:3,close:0};

  this.layer = function()
  {
    if(!this.layers[this.index]){
      this.layers[this.index] = [];
    }
    return this.layers[this.index];
  }

  this.remove_segment = function()
  {
    this.layer().pop();
    this.clear();
    dotgrid.draw();
  }

  this.remove_segments_at = function(pos)
  {

  }

  this.add_vertex = function(pos)
  {
    this.verteces.push(pos);
  }

  this.cast = function(type)
  {
    if(!this.layer()){ this.layers[this.index] = []; }
    if(!this.can_cast(type)){ console.warn("Cannot cast"); return; }

    this.layer().push({type:type,verteces:this.verteces.slice()})
    this.clear();
    dotgrid.draw();
    dotgrid.history.push(this.layers);

    console.log(`Casted ${type} -> ${this.layer().length} elements`);
  }

  this.can_cast = function(type)
  {
    // Cannot cast close twice
    if(type == "close"){
      var prev = this.layer()[this.layer().length-1];
      if(prev.type == "close"){
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
}