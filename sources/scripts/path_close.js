function Path_Close()
{
  this.to_segment = function(prev)
  {
    return "Z ";
  }
}