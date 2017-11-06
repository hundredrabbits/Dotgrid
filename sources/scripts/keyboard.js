function Keyboard()
{
  this.listen = function(event)
  { 
    // save
    if(event.key == "s" && (event.ctrlKey || event.metaKey)){
      dotgrid.export();
      return;
    }

    switch (event.keyCode) {
      case 83 : dotgrid.draw_arc(event.shiftKey ? "1,1" : "0,1"); break; // 'S'
      case 65 : dotgrid.draw_arc(event.shiftKey ? "1,0" : "0,0"); break; // 'a'
      case 68 : dotgrid.draw_line(); break; // 'd'
      case 70 : dotgrid.draw_bezier(); break; // 'f'
      case 82 : dotgrid.draw_close(); break; // 'r'
      case 187 : dotgrid.mod_thickness(1); break; // '+'
      case 189 : dotgrid.mod_thickness(-1); break; // '-'
      case 191 : dotgrid.mod_linecap(1); break; // '/'

      case 81 : dotgrid.reset(); break; // 'Q'
      case 27 : dotgrid.reset(); break; // 'ESC'
      case 87 : dotgrid.erase(); break; // 'W'
      case 8 : dotgrid.erase(); break; // 'Backspace'
      case 69 : dotgrid.export(); break; // 'e'

      case 38 : dotgrid.mod_move(0,-10); break; // 'up'
      case 40 : dotgrid.mod_move(0,10); break;  // 'down'
      case 37 : dotgrid.mod_move(-10,0); break;  // 'left'
      case 39 : dotgrid.mod_move(10,0); break; // 'right'
    }
    dotgrid.draw();
  }
}
