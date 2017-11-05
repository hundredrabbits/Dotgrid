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

    html += "A"+this.to.sub(this.from)+" 0 "+orientation+" "+this.to+" ";

    if(this.end){
      html += "A"+this.end.sub(this.to)+" 0 "+orientation+" "+this.end+" ";
    }

    return html 
  }
}