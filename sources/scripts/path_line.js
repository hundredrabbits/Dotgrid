function Path_Line(from,to,end = null)
{
  this.from = from;
  this.to = to;
  this.end = end;

  this.to_segment = function(prev)
  {
    var html = ""

    if(!prev || (!prev.to && !prev.end)){
      html += "M"+this.from+" ";  
    }
    else if(prev){
      if(prev.end){
        if(!prev.end.is_equal(this.from)){
          html += "M"+this.from+" ";  
        }         
      }
      else if(prev.to){
        if(!prev.to.is_equal(this.from)){
          html += "M"+this.from+" "; 
        }
      }
    }

    html += "L"+this.to+" "

    if(this.end){
      html += "L"+this.end+" "
    }

    return html
  }
}