function Keyboard()
{
  this.listen = function(e)
  { 
    // zoom
    if(e.key == "~" || e.keyCode == 192){
      dotgrid.interface.toggle_zoom();
      e.preventDefault();
      return;
    }

    // save
    if(e.key == "s" && (e.ctrlKey || e.metaKey)){
      e.preventDefault();
      dotgrid.export();
      return;
    }

    // open
    if(e.key == "o" && (e.ctrlKey || e.metaKey)){
      e.preventDefault();
      dotgrid.open();
      return;
    }

    // undo
    if(e.key == "z" && (e.ctrlKey || e.metaKey)){
      e.preventDefault();
      dotgrid.erase();
      return;
    }

    // new
    if(e.key == "n" && (e.ctrlKey || e.metaKey)){
      e.preventDefault();
      dotgrid.clear();
      return;
    }

    // Reset
    if((e.key == "Backspace" || e.key == "Delete") && e.ctrlKey && e.shiftKey){
      e.preventDefault();
      dotgrid.theme.reset();
      return;
    }

    var numbers = ["0","1","2","3","4","5","6","7","8","9"]
    if(numbers.indexOf(e.key) > -1 || e.code == "Digit0" || e.keyCode == 48){
      keyboard.cheatcode(e.key);
      return;
    }
    else{
      this.code_history = "";
    }

    switch(e.keyCode || e.key) {
      case 65 : dotgrid.draw_arc(e.shiftKey ? "1,0" : "0,0"); break; // 'a/A'
      case 83 : dotgrid.draw_arc(e.shiftKey ? "1,1" : "0,1"); break; // 's/S'
      case 68 : dotgrid.draw_line(); break; // 'd'
      case 70 : dotgrid.draw_bezier(); break; // 'f'
      case "g" : dotgrid.draw_close(); break;
      case 71 : dotgrid.draw_close(); break; // 'g'
      case "h" : dotgrid.toggle_fill(); break;
      case 72 : dotgrid.toggle_fill(); break; // 'g'

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

  this.code_history = "";

  this.cheatcode = function(key)
  {
    if(key.length != 1){ return; }
    this.code_history += key;

    if(this.code_history.length == 2){
      var x = this.code_history.substr(0,2);
      var y = 15;
      dotgrid.move_cursor(new Pos(x * -15,y * 15))
    }
    if(this.code_history.length > 3){
      var x = this.code_history.substr(0,2);
      var y = this.code_history.substr(2,2);
      dotgrid.add_point(new Pos(x * -15,y * 15))
      dotgrid.move_cursor(new Pos(x * -15,y * 15))
      this.code_history = "";
    }
  }
}
