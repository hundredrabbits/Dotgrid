function Path_Close()
{
  this.name = "close";

  this.to_segment = function(prev)
  {
    return "Z ";
  }

  this.handles = function()
  {
    return [];
  }
}