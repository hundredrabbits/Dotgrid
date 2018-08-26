function Generator(layer,style)
{
  this.layer = layer;
  this.style = style;

  function operate(layer,offset,scale,mirror = 0,angle = 0)
  {
    let l = copy(layer)

    for(let k1 in l){
      let seg = l[k1];
      for(let k2 in seg.vertices){
        if(mirror == 1){ seg.vertices[k2].x = (dotgrid.tool.settings.size.width) - seg.vertices[k2].x + 15 }
        if(mirror == 2){ seg.vertices[k2].y = (dotgrid.tool.settings.size.height) - seg.vertices[k2].y + 30 }

        // Offset
        seg.vertices[k2].x += offset.x
        seg.vertices[k2].y += offset.y

        // Rotate
        let center = {x:(dotgrid.tool.settings.size.width/2)+offset.x+(7.5),y:(dotgrid.tool.settings.size.height/2)+offset.y+30}
        seg.vertices[k2] = rotate_point(seg.vertices[k2],center,angle)

        // Scale
        seg.vertices[k2].x *= scale
        seg.vertices[k2].y *= scale
      }
    }
    return l;
  }

  this.render = function(prev,segment,mirror = 0)
  {
    let type = segment.type;
    let vertices = segment.vertices;
    let html = '';
    let skip = 0;

    for(let id in vertices){
      if(skip > 0){ skip -= 1; continue; }
      
      let vertex = vertices[id]
      let next = vertices[parseInt(id)+1]
      let after_next = vertices[parseInt(id)+2]

      if(id == 0 && !prev || id == 0 && prev && (prev.x != vertex.x || prev.y != vertex.y)){
        html += `M${vertex.x},${vertex.y} `  
      }
      
      if(type == "line"){ 
        html += `L${vertex.x},${vertex.y} `;  
      }
      else if(type == "arc_c"){ 
        let clock = mirror > 0 ? '0,0' : '0,1'
        html += next ? `A${Math.abs(next.x - vertex.x)},${Math.abs(next.y - vertex.y)} 0 ${clock} ${next.x},${next.y} ` : ''; 
      }
      else if(type == "arc_r"){ 
        let clock = mirror > 0 ? '0,1' : '0,0'
        html += next ? `A${Math.abs(next.x - vertex.x)},${Math.abs(next.y - vertex.y)} 0 ${clock} ${next.x},${next.y} ` : ''; 
      }
      else if(type == "bezier"){ 
        html += next && after_next ?`Q${next.x},${next.y} ${after_next.x},${after_next.y} ` : ''; 
        skip = 1
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

  this.convert = function(layer,mirror,angle)
  {
    let s = ""
    let prev = null
    for(let id in layer){
      let seg = layer[id];
      s += `${this.render(prev,seg,mirror)}`
      prev = seg.vertices ? seg.vertices[seg.vertices.length-1] : null
    }

    return s;
  }

  this.toString = function(offset = {x:0,y:0}, scale = 1, mirror = this.style && this.style.mirror_style ? this.style.mirror_style : 0)
  {
    let s = this.convert(operate(this.layer,offset,scale))

    if(mirror == 1 || mirror == 2){
      s += this.convert(operate(this.layer,offset,scale,mirror),mirror)
    }

    if(mirror == 3){
      s += this.convert(operate(this.layer,offset,scale,mirror,120),mirror)
      s += this.convert(operate(this.layer,offset,scale,mirror,240),mirror)  
    }
    if(mirror == 4){
      s += this.convert(operate(this.layer,offset,scale,mirror,72),mirror)
      s += this.convert(operate(this.layer,offset,scale,mirror,144),mirror)  
      s += this.convert(operate(this.layer,offset,scale,mirror,216),mirror)  
      s += this.convert(operate(this.layer,offset,scale,mirror,288),mirror)  
    }

    return s
  }

  function copy(data){ return data ? JSON.parse(JSON.stringify(data)) : []; }
  function rotate_point(point, origin, angle){ angle = angle * Math.PI / 180.0; return { x: (Math.cos(angle) * (point.x-origin.x) - Math.sin(angle) * (point.y-origin.y) + origin.x).toFixed(1), y: (Math.sin(angle) * (point.x-origin.x) + Math.cos(angle) * (point.y-origin.y) + origin.y).toFixed(1) }; }
}