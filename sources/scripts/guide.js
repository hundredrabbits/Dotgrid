function Guide()
{
  this.el = document.createElement("div");

  // Guide
  this.el.id = "guide";

  this.start = function()
  {
    // Markers
    for (var x = dotgrid.grid_x; x >= 0; x--) {
      for (var y = dotgrid.grid_y; y >= 0; y--) {
        var marker = document.createElement("div");
        marker.setAttribute("class",(x % dotgrid.block_x == 0 && y % dotgrid.block_y == 0 ? "marker bm" : "marker bl"));
        marker.style.left = parseInt(x * dotgrid.grid_width + (dotgrid.grid_width/2)) +5;
        marker.style.top = parseInt(y * dotgrid.grid_height + (dotgrid.grid_height/2)) +5;
        this.el.appendChild(marker);
      }
    }
  }
}