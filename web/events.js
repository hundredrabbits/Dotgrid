'use strict';

document.onkeyup = (e) =>
{
  const ch = e.key.toLowerCase();

  if(e.target && e.target.id == "picker_input"){ return; }

  if(ch == "backspace" && e.ctrlKey){ DOTGRID.theme.reset(); e.preventDefault(); }
  if(ch == "backspace"){ DOTGRID.tool.remove_segment(); e.preventDefault(); }
  if(ch == "escape"){ DOTGRID.tool.clear(); DOTGRID.picker.stop(); e.preventDefault(); }

  if(ch == "1"){ DOTGRID.tool.select_layer(0); e.preventDefault(); }
  if(ch == "2"){ DOTGRID.tool.select_layer(1); e.preventDefault(); }
  if(ch == "3"){ DOTGRID.tool.select_layer(2); e.preventDefault(); }  

  if(ch == "h"){ DOTGRID.guide.toggle(); e.preventDefault(); }
  if(ch == "?"){ DOTGRID.reset(); DOTGRID.theme.reset(); e.preventDefault(); }

  if(ch == "a"){ DOTGRID.tool.cast("line"); e.preventDefault(); }
  if(ch == "s"){ DOTGRID.tool.cast("arc_c"); e.preventDefault(); }
  if(ch == "d"){ DOTGRID.tool.cast("arc_r"); e.preventDefault(); }
  if(ch == "f"){ DOTGRID.tool.cast("bezier"); e.preventDefault(); }
  if(ch == "z"){ DOTGRID.tool.cast("close"); e.preventDefault(); }

  if(ch == "q"){ DOTGRID.tool.toggle("linecap"); e.preventDefault(); }
  if(ch == "w"){ DOTGRID.tool.toggle("linejoin"); e.preventDefault(); }
  if(ch == "e"){ DOTGRID.tool.toggle("mirror"); e.preventDefault(); }
  if(ch == "r"){ DOTGRID.tool.toggle("fill"); e.preventDefault(); }
  if(ch == "g"){ DOTGRID.picker.start(); e.preventDefault(); }
  if(ch == "}"){ DOTGRID.tool.toggle("thickness",1); e.preventDefault(); }
  if(ch == "{"){ DOTGRID.tool.toggle("thickness",-1); e.preventDefault(); }
  if(ch == "]"){ DOTGRID.tool.toggle("thickness",5); e.preventDefault(); }
  if(ch == "["){ DOTGRID.tool.toggle("thickness",-5); e.preventDefault(); }
  
  if(ch == "i"){ DOTGRID.theme.invert(); e.preventDefault(); }
}

document.onkeydown = (e) => 
{
  if(e.keyCode == 9){ DOTGRID.tool.select_next_layer(); e.preventDefault(); }
}