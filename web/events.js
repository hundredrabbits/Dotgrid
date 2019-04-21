'use strict';

document.onkeyup = (e) =>
{
  const ch = e.key.toLowerCase();

  if(e.target && e.target.id === "picker_input"){ return; }

  // Output
  if((e.ctrlKey || e.metaKey) && ch === "s"){ dotgrid.save(); e.preventDefault(); return; }
  if((e.ctrlKey || e.metaKey) && ch === "r"){ dotgrid.render(); e.preventDefault(); return; }
  if((e.ctrlKey || e.metaKey) && ch === "e"){ dotgrid.export(); e.preventDefault(); return; }
  if((e.ctrlKey || e.metaKey) && ch === "k"){ dotgrid.tool.toggleCrest(); e.preventDefault(); return; }

  if(ch === "backspace" && e.ctrlKey){ dotgrid.theme.reset(); e.preventDefault(); }
  if(ch === "backspace"){ dotgrid.tool.removeSegment(); e.preventDefault(); }
  if(ch === "escape"){ dotgrid.tool.clear(); dotgrid.picker.stop(); e.preventDefault(); }

  if(ch === "1"){ dotgrid.tool.selectLayer(0); e.preventDefault(); }
  if(ch === "2"){ dotgrid.tool.selectLayer(1); e.preventDefault(); }
  if(ch === "3"){ dotgrid.tool.selectLayer(2); e.preventDefault(); }  

  if(ch === "h"){ dotgrid.renderer.toggle(); e.preventDefault(); }
  if(ch === "?"){ dotgrid.reset(); dotgrid.theme.reset(); e.preventDefault(); }

  if(ch === "a"){ dotgrid.tool.cast("line"); e.preventDefault(); }
  if(ch === "s"){ dotgrid.tool.cast("arc_c"); e.preventDefault(); }
  if(ch === "d"){ dotgrid.tool.cast("arc_r"); e.preventDefault(); }
  if(ch === "t"){ dotgrid.tool.cast("arc_c_full"); e.preventDefault(); }
  if(ch === "y"){ dotgrid.tool.cast("arc_r_full"); e.preventDefault(); }
  if(ch === "f"){ dotgrid.tool.cast("bezier"); e.preventDefault(); }
  if(ch === "z"){ dotgrid.tool.cast("close"); e.preventDefault(); }

  if(ch === "q"){ dotgrid.tool.toggle("linecap"); e.preventDefault(); }
  if(ch === "w"){ dotgrid.tool.toggle("linejoin"); e.preventDefault(); }
  if(ch === "e"){ dotgrid.tool.toggle("mirror"); e.preventDefault(); }
  if(ch === "r"){ dotgrid.tool.toggle("fill"); e.preventDefault(); }
  if(ch === "g"){ dotgrid.picker.start(); e.preventDefault(); }
  if(ch === "}"){ dotgrid.tool.toggle("thickness",1); e.preventDefault(); }
  if(ch === "{"){ dotgrid.tool.toggle("thickness",-1); e.preventDefault(); }
  if(ch === "]"){ dotgrid.tool.toggle("thickness",5); e.preventDefault(); }
  if(ch === "["){ dotgrid.tool.toggle("thickness",-5); e.preventDefault(); }
  
  if(ch === "m"){ dotgrid.tool.merge(); e.preventDefault(); }
  
  if(ch === "i"){ dotgrid.theme.invert(); e.preventDefault(); }
}

document.onkeydown = (e) => 
{
  if(e.keyCode === 9){ dotgrid.tool.selectNextLayer(); e.preventDefault(); }
}