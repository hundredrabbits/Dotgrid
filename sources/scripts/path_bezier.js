function Path_Bezier(from,to,end)
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
      if(prev.end && !prev.end.is_equal(this.from)){
        html += "M"+this.from+" "; 
      }
      else if(prev.to && !prev.to.is_equal(this.from)){
        html += "M"+this.from+" "; 
      }
    }

    return html += "Q"+this.to+" "+this.end+" "
  }
}