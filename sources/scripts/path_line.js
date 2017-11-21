function Path_Line(from,to,end = null)
{
  this.__serialized_name__ = "Path_Line";
  this.name = "line";
  
  this.from = from;
  this.to = to;
  this.end = end;

  this.to_segment = function(prev)
  {
    var html = ""

    if(!prev || (!prev.to && !prev.end)){
      html += "M"+this.from.scale(dotgrid.scale)+" ";  
    }
    else if(prev){
      if(prev.end){
        if(!prev.end.is_equal(this.from.scale(dotgrid.scale))){
          html += "M"+this.from.scale(dotgrid.scale)+" ";  
        }         
      }
      else if(prev.to){
        if(!prev.to.is_equal(this.from.scale(dotgrid.scale))){
          html += "M"+this.from.scale(dotgrid.scale)+" "; 
        }
      }
    }

    html += "L"+this.to.scale(dotgrid.scale)+" "

    if(this.end){
      html += "L"+this.end.scale(dotgrid.scale)+" "
    }

    return html
  }

  this.handles = function()
  {
    var a = [];
    if(this.from){ a.push(this.from); }
    if(this.to){ a.push(this.to); }
    if(this.end){ a.push(this.end); }
    return a;
  }
}