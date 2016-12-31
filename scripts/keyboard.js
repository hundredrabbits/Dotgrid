function Keyboard()
{
  this.listen = function(event)
  { 
    console.log(event);
    switch (event.keyCode) {
      case 65 : dotgrid.draw_arc(event.shiftKey ? "1,1" : "0,1"); break;
      case 83 : dotgrid.draw_arc(event.shiftKey ? "1,0" : "0,0"); break;
      case 68 : dotgrid.draw_line(); break;
      case 70 : dotgrid.reset(); break;
      case 71 : dotgrid.erase(); break;
    }
  }
}
