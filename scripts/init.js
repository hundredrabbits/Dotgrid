dotgrid = new Dotgrid(300,300,20,20);
dotgrid.install();

var keyboard = new Keyboard();
document.onkeyup = function myFunction(){ keyboard.listen(event); };

document.addEventListener('mousedown', function(e){ dotgrid.mouse_down(e); }, false);
document.addEventListener('mousemove', function(e){ dotgrid.mouse_move(e); }, false);
document.addEventListener('mouseup', function(e){ dotgrid.mouse_up(e);}, false);