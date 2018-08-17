document.onkeydown = function key_down(e)
{
  
};

document.onkeyup = (e) =>
{
  var ch = e.key.toLowerCase();

  console.log(ch);

  if(ch == "1"){ dotgrid.tool.select_layer(0); }
  if(ch == "2"){ dotgrid.tool.select_layer(1); }
  if(ch == "3"){ dotgrid.tool.select_layer(2); }

  if(ch == "u"){ dotgrid.interface.toggle(); }
  if(ch == "h"){ dotgrid.guide.toggle(); }

  if(ch == "a"){ dotgrid.tool.cast("line"); }
  if(ch == "s"){ dotgrid.tool.cast("arc_c"); }
  if(ch == "d"){ dotgrid.tool.cast("arc_r"); }
  if(ch == "f"){ dotgrid.tool.cast("bezier"); }
  if(ch == "z"){ dotgrid.tool.cast("close"); }

  if(ch == "q"){ dotgrid.tool.toggle("linecap"); }
  if(ch == "w"){ dotgrid.tool.toggle("linejoin"); }
  if(ch == "e"){ dotgrid.tool.toggle("mirror"); }
  if(ch == "r"){ dotgrid.tool.toggle("fill"); }
  if(ch == "g"){ dotgrid.picker.start(); }
  if(ch == "}"){ dotgrid.tool.toggle("thickness",1); }
  if(ch == "{"){ dotgrid.tool.toggle("thickness",-1); }
  if(ch == "]"){ dotgrid.tool.toggle("thickness",5); }
  if(ch == "["){ dotgrid.tool.toggle("thickness",-5); }
}