function Guide()
{
  this.el = document.createElement("canvas");
  this.el.id = "guide";
  this.el.width = 600;
  this.el.height = 600;
  this.el.style.width = "300px";
  this.el.style.height = "300px";
  this.markers;

  this.start = function()
  {
    this.update();
  }

  this.clear = function()
  {
    this.el.getContext('2d').clearRect(0, 0, 600, 600);
  }

  this.update = function()
  {
    this.clear();

    for (var x = dotgrid.grid_x; x >= 0; x--) {
      for (var y = dotgrid.grid_y; y >= 0; y--) {
        var pos_x = parseInt(x * dotgrid.grid_width) ;
        var pos_y = parseInt(y * dotgrid.grid_height) ;
        var is_step = x % dotgrid.block_x == 0 && y % dotgrid.block_y == 0;
        var radius = is_step ? 1.5 : 0.5;
        dotgrid.guide.draw_marker({x:pos_x * 2,y:pos_y * 2},radius,is_step);
      }
    }
  }

  this.draw_marker = function(pos,radius = 1,step)
  {
    var ctx = this.el.getContext('2d');
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = step ? 'green' : 'red';
    ctx.fill();
  }
}