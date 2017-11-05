function Keyboard()
{
  this.listen = function(event)
  { 
    console.log(event.keyCode)

    switch (event.keyCode) {
      case 83 : dotgrid.draw_arc(event.shiftKey ? "1,1" : "0,1"); break;
      case 65 : dotgrid.draw_arc(event.shiftKey ? "1,0" : "0,0"); break;
      case 68 : dotgrid.draw_line(); break;
      case 70 : dotgrid.draw_bezier(); break;
      case 82 : dotgrid.draw_close(); break;
      case 187 : dotgrid.mod_thickness(1); break;
      case 189 : dotgrid.mod_thickness(-1); break;
      case 191 : dotgrid.mod_linecap(1); break;

      case 81 : dotgrid.reset(); break;
      case 27 : dotgrid.reset(); break;
      case 87 : dotgrid.erase(); break;
      case 8 : dotgrid.erase(); break;
      case 69 : dotgrid.export(); break;

      case 38 : dotgrid.mod_move(0,-1); break;
      case 40 : dotgrid.mod_move(0,1); break;
      case 37 : dotgrid.mod_move(1,0); break;
      case 39 : dotgrid.mod_move(-1,0); break;
    }
    dotgrid.draw();
  }
}
