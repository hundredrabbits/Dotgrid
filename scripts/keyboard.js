function Keyboard()
{
  this.listen = function(event)
  { 
    console.log(event.keyCode);

    switch (event.key || event.keyCode) {
      case 65 : dotgrid.draw_arc_a(); break;
      case 83 : dotgrid.draw_arc_c(); break;
      case 68 : dotgrid.draw_line(); break;
      case 70 : dotgrid.reset(); break;
      case 71 : dotgrid.erase(); break;
    }
  }
}
