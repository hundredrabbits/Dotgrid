function Generator(layer)
{
  this.layer = layer;

  function operate(layer,offset,scale,mirror = 0)
  {
    var l = copy(layer)

    for(k1 in l){
      var seg = l[k1];
      for(k2 in seg.vertices){
        if(mirror == 1){ seg.vertices[k2].x = (dotgrid.tool.settings.size.width) - seg.vertices[k2].x }
        if(mirror == 2){ seg.vertices[k2].y = (dotgrid.tool.settings.size.height) - seg.vertices[k2].y }
        seg.vertices[k2].x += offset.x
        seg.vertices[k2].x *= scale
        seg.vertices[k2].y += offset.y
        seg.vertices[k2].y *= scale
      }
    }
    return l;
  }

  this.render = function(prev,segment,mirror = 0)
  {
    var type = segment.type;
    var vertices = segment.vertices;
    var html = '';
    var skip = 0;

    for(id in vertices){
      if(skip > 0){ skip -= 1; continue; }
      
      var vertex = vertices[id]
      var next = vertices[parseInt(id)+1]
      var after_next = vertices[parseInt(id)+2]

      if(id == 0 && !prev || id == 0 && prev && (prev.x != vertex.x || prev.y != vertex.y)){
        html += `M${vertex.x},${vertex.y} `  
      }
      
      if(type == "line"){ 
        html += `L${vertex.x},${vertex.y} `;  
      }
      else if(type == "arc_c"){ 
        var clock = mirror > 0 ? '0,0' : '0,1'
        html += next ? `A${next.x - vertex.x},${next.y - vertex.y} 0 ${clock} ${next.x},${next.y} ` : ''; 
      }
      else if(type == "arc_r"){ 
        var clock = mirror > 0 ? '0,1' : '0,0'
        html += next ? `A${next.x - vertex.x},${next.y - vertex.y} 0 ${clock} ${next.x},${next.y} ` : ''; 
      }
      else if(type == "bezier"){ 
        html += next && after_next ?`Q${next.x},${next.y} ${after_next.x},${after_next.y} ` : ''; 
        skip = 2
      }
      else{ 
        console.warn(`unknown type:${type}`)
      }
    }

    if(segment.type == "close"){
      html += "Z "
    }
  
    return html
  }

  this.convert = function(layer,mirror)
  {
    var s = ""
    var prev = null
    for(id in layer){
      var seg = layer[id];
      s += `${this.render(prev,seg,mirror)}`
      prev = seg.vertices ? seg.vertices[seg.vertices.length-1] : null
    }

    return s;
  }

  this.toString = function(offset = {x:0,y:0}, scale = 1, mirror = dotgrid.tool.style().mirror_style)
  {
    var s = this.convert(operate(this.layer,offset,scale))

    if(mirror == 1 || mirror == 2){
      s += this.convert(operate(this.layer,offset,scale,mirror),mirror)
    }
    return s
  }

  function copy(data){ return data ? JSON.parse(JSON.stringify(data)) : []; }
  function rotate_point(pointX, pointY, originX, originY, angle){ angle = angle * Math.PI / 180.0; return { x: (Math.cos(angle) * (pointX-originX) - Math.sin(angle) * (pointY-originY) + originX).toFixed(1), y: (Math.sin(angle) * (pointX-originX) + Math.cos(angle) * (pointY-originY) + originY).toFixed(1) }; }
}