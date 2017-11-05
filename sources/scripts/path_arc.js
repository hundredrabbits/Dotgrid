function Path_Arc(from,to,orientation,end)
{
  this.from = from;
  this.to = to;
  this.orientation = orientation;
  this.end = end;

  this.to_segment = function(prev)
  {
    var html = ""

    if(!prev){
      html += "M"+this.from+" ";  
    }
    else if(prev){
      if(prev.to.x != this.from.x && prev.to.y != this.from.y && !prev.end){
        html += "M"+this.from+" ";  
      }
      else if(prev.end && prev.end.x != this.from.x && prev.end.y != this.from.y){
        html += "M"+this.from+" ";  
      }
    }

    html += "A"+this.to.sub(this.from)+" 0 "+orientation+" "+this.to+" ";

    if(this.end){
      html += "A"+this.end.sub(this.to)+" 0 "+orientation+" "+this.end+" ";
    }

    return html 
  }
}