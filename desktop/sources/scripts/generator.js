function Generator(layer)
{
  this.layer = layer;

  function operate(layer,offset,scale)
  {
    var l = copy(layer)

    for(k1 in l){
      var seg = l[k1];
      for(k2 in seg.vertices){
        seg.vertices[k2].x += offset.x
        seg.vertices[k2].x *= scale
        seg.vertices[k2].y += offset.y
        seg.vertices[k2].y *= scale
      }
    }

    return l;
  }

  this.render = function(segment)
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

      if(id == 0){
        html += `M${vertex.x},${vertex.y} `
      }
      else if(type == "line"){ 
        html += `L${vertex.x},${vertex.y} `;  
      }
      else if(type == "arc_c"){ 
        html += next ? `A${next.x - vertex.x},${next.y - vertex.y} 0 0,1 ${next.x},${next.y} ` : ''; 
      }
      else if(type == "arc_r"){ 
        html += next ? `A${next.x - vertex.x},${next.y - vertex.y} 0 0,0 ${next.x},${next.y} ` : ''; 
      }
      else if(type == "bezier"){ 
        html += next && after_next ?`Q${next.x},${next.y} ${after_next.x},${after_next.y} ` : ''; 
        skip = 1
      }
      else{ 
        console.warn(`unknown type:${type}`)
      }
    }
  
    return html
  }

  this.toString = function(offset = {x:0,y:0}, scale = 1)
  {
    var s = ""

    var layer = operate(this.layer,offset,scale)

    for(id in layer){
      var seg = layer[id];
      s += `${this.render(seg)}`
    }

    return s.trim()
  }

  function copy(data){ return data ? JSON.parse(JSON.stringify(data)) : []; }
}