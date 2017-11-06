function Pos(x,y)
{
  this.x = x;
  this.y = y;

  this.toString = function()
  {
    return x+","+y;
  }

  this.sub = function(pos2)
  {
    return new Pos(this.x - pos2.x,this.y - pos2.y)
  }

  this.add = function(pos2)
  {
    return new Pos(this.x + pos2.x,this.y + pos2.y)
  }

  this.is_equal = function(pos2)
  {
    return pos2.x == this.x && pos2.y == this.y;
  }
}