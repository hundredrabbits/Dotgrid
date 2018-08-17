document.onkeyup = (e) =>
{
  var ch = e.key.toLowerCase();

  if(e.target && e.target.id == "picker"){ return; }

  if(ch == "backspace"){ dotgrid.tool.remove_segment(); e.preventDefault(); }
  if(ch == "escape"){ dotgrid.tool.clear(); e.preventDefault(); }

  if(ch == "1"){ dotgrid.tool.select_layer(0); e.preventDefault(); }
  if(ch == "2"){ dotgrid.tool.select_layer(1); e.preventDefault(); }
  if(ch == "3"){ dotgrid.tool.select_layer(2); e.preventDefault(); }

  if(ch == "h"){ dotgrid.guide.toggle(); e.preventDefault(); }
  if(ch == "?"){ dotgrid.reset(); dotgrid.theme.reset(); e.preventDefault(); }

  if(ch == "a"){ dotgrid.tool.cast("line"); e.preventDefault(); }
  if(ch == "s"){ dotgrid.tool.cast("arc_c"); e.preventDefault(); }
  if(ch == "d"){ dotgrid.tool.cast("arc_r"); e.preventDefault(); }
  if(ch == "f"){ dotgrid.tool.cast("bezier"); e.preventDefault(); }
  if(ch == "z"){ dotgrid.tool.cast("close"); e.preventDefault(); }

  if(ch == "q"){ dotgrid.tool.toggle("linecap"); e.preventDefault(); }
  if(ch == "w"){ dotgrid.tool.toggle("linejoin"); e.preventDefault(); }
  if(ch == "e"){ dotgrid.tool.toggle("mirror"); e.preventDefault(); }
  if(ch == "r"){ dotgrid.tool.toggle("fill"); e.preventDefault(); }
  if(ch == "g"){ dotgrid.picker.start(); e.preventDefault(); }
  if(ch == "}"){ dotgrid.tool.toggle("thickness",1); e.preventDefault(); }
  if(ch == "{"){ dotgrid.tool.toggle("thickness",-1); e.preventDefault(); }
  if(ch == "]"){ dotgrid.tool.toggle("thickness",5); e.preventDefault(); }
  if(ch == "["){ dotgrid.tool.toggle("thickness",-5); e.preventDefault(); }
}