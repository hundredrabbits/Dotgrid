function Path_Line(from,to,end = null)
{
  this.from = from;
  this.to = to;
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

    html += "L"+this.to+" "

    if(this.end){
      html += "L"+this.end+" "
    }

    return html
  }
}