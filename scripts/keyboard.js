function Keyboard()
{
  this.listen = function(event)
  { 
    console.log(event.keyCode);
    switch (event.keyCode) {
      case 65 : dotgrid.draw_arc(event.shiftKey ? "1,1" : "0,1"); break;
      case 83 : dotgrid.draw_arc(event.shiftKey ? "1,0" : "0,0"); break;
      case 68 : dotgrid.draw_line(); break;

      case 81 : dotgrid.reset(); break;
      case 87 : dotgrid.erase(); break;
      case 80 : dotgrid.export(); break;
    }
  }
}
