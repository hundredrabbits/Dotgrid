dotgrid = new Dotgrid(300,300,10,10);
dotgrid.install();

document.addEventListener('mousedown', function(e){ dotgrid.mouse_down(e); }, false);
document.addEventListener('mousemove', function(e){ dotgrid.mouse_move(e); }, false);
document.addEventListener('mouseup', function(e){ dotgrid.mouse_up(e);}, false);