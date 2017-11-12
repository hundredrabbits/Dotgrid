function Path_Arc(from,to,orientation,end)
{
  this.name = "arc";

  this.from = from;
  this.to = to;
  this.orientation = orientation;
  this.end = end;

  this.to_segment = function(prev)
  {
    var html = ""

    if(!prev || (!prev.to && !prev.end)){
      html += "M"+this.from.scale(dotgrid.scale)+" ";  
    }
    else if(prev){
      if(prev.end){
        if(!prev.end.is_equal(this.from)){
          html += "M"+this.from.scale(dotgrid.scale)+" ";  
        }         
      }
      else if(prev.to){
        if(!prev.to.is_equal(this.from)){
          html += "M"+this.from.scale(dotgrid.scale)+" "; 
        }
      }
    }

    html += "A"+this.to.sub(this.from).scale(dotgrid.scale)+" 0 "+orientation+" "+this.to.scale(dotgrid.scale)+" ";

    if(this.end){
      html += "A"+this.end.sub(this.to).scale(dotgrid.scale)+" 0 "+orientation+" "+this.end.scale(dotgrid.scale)+" ";
    }

    return html 
  }
}