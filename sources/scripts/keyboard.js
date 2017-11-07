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

    // Reset
    if((e.key == "Backspace" || e.key == "Delete") && e.ctrlKey && e.shiftKey){
      e.preventDefault();
      dotgrid.theme.reset();
      return;
    }

    switch (e.keyCode) {
      case 83 : dotgrid.draw_arc(e.shiftKey ? "1,1" : "0,1"); break; // 'S'
      case 65 : dotgrid.draw_arc(e.shiftKey ? "1,0" : "0,0"); break; // 'a'
      case 68 : dotgrid.draw_line(); break; // 'd'
      case 70 : dotgrid.draw_bezier(); break; // 'f'
      case 82 : dotgrid.draw_close(); break; // 'r'
      case 187 : dotgrid.mod_thickness(1); break; // '+'
      case 189 : dotgrid.mod_thickness(-1); break; // '-'
      case 221 : dotgrid.mod_thickness(1); break; // ']'
      case 219 : dotgrid.mod_thickness(-1); break; // '['
      case 191 : dotgrid.mod_linecap(1); break; // '/'
      
      case 32 : dotgrid.mirror = dotgrid.mirror == true ? false : true; dotgrid.draw(); break; // 'space'

      case 81 : dotgrid.reset(); break; // 'Q'
      case 27 : dotgrid.reset(); break; // 'ESC'
      case 87 : dotgrid.erase(); break; // 'W'
      case 8 : dotgrid.erase(); break; // 'Backspace'
      case 69 : dotgrid.export(); break; // 'e'
      case 13 : dotgrid.export(); break; // 'Enter'

      case 9 : dotgrid.toggle_fill(); e.preventDefault(); break; // 'tab'

      case 38 : dotgrid.mod_move(new Pos(0,-10)); break; // 'up'
      case 40 : dotgrid.mod_move(new Pos(0,10)); break;  // 'down'
      case 37 : dotgrid.mod_move(new Pos(-10,0)); break;  // 'left'
      case 39 : dotgrid.mod_move(new Pos(10,0)); break; // 'right'
    }
    dotgrid.draw();
  }
}
