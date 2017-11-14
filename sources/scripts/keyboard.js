function Keyboard()
{
  this.listen = function(e)
  { 
    // save
    if(e.key == "s" && (e.ctrlKey || e.metaKey)){
      dotgrid.export();
      return;
    }

    // undo
    if(e.key == "z" && (e.ctrlKey || e.metaKey)){
      dotgrid.erase();
      return;
    }

    // new
    if(e.key == "n" && (e.ctrlKey || e.metaKey)){
      dotgrid.clear();
      return;
    }

    // Reset
    if((e.key == "Backspace" || e.key == "Delete") && e.ctrlKey && e.shiftKey){
      e.preventDefault();
      dotgrid.theme.reset();
      return;
    }

    switch(e.key){

    }
    switch(e.keyCode) {
      case 65 : dotgrid.draw_arc(e.shiftKey ? "1,0" : "0,0"); break; // 'a/A'
      case 83 : dotgrid.draw_arc(e.shiftKey ? "1,1" : "0,1"); break; // 's/S'
      case 68 : dotgrid.draw_line(); break; // 'd'
      case 70 : dotgrid.draw_bezier(); break; // 'f'
      case "g" : dotgrid.draw_close(); break;
      case 71 : dotgrid.draw_close(); break; // 'g'

      case "[" : dotgrid.mod_thickness(-1); break;
      case 219 : dotgrid.mod_thickness(-1); break; // '['
      case "]" : dotgrid.mod_thickness(1); break;
      case 221 : dotgrid.mod_thickness(1); break; // ']'

      case "+" : dotgrid.mod_thickness(1); break;
      case "-" : dotgrid.mod_thickness(-1); break;
      case "<" : dotgrid.mod_thickness(1); break;
      case ">" : dotgrid.mod_thickness(-1); break;

      case "/" : dotgrid.mod_linecap(1); break; // '/'
      case 191 : dotgrid.mod_linecap(1); break; // '/'
      
      case "space" : dotgrid.mod_linecap(1); break; // '/'
      case 32 : dotgrid.mod_mirror(); break; // 'space'

      case "Escape" : dotgrid.mod_linecap(1); break; // '/'
      case 27 : dotgrid.reset(); break; // 'ESC'
      case 8 : dotgrid.erase(); break; // 'Backspace'
      case 13 : dotgrid.export(); break; // 'Enter'

      case 9 : dotgrid.interface.toggle(); e.preventDefault(); break; // 'tab'

      case 38 : dotgrid.mod_move(new Pos(0,-15)); break; // 'up'
      case 40 : dotgrid.mod_move(new Pos(0,15)); break;  // 'down'
      case 37 : dotgrid.mod_move(new Pos(-15,0)); break;  // 'left'
      case 39 : dotgrid.mod_move(new Pos(15,0)); break; // 'right'
    }
    dotgrid.draw();
  }
}
