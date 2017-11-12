function Guide()
{
  this.el = document.createElement("div");

  // Guide
  this.el.id = "guide";
  this.markers;
  this.start = function()
  {
    // Markers
    this.markers = JSON.parse("["+"[],".repeat(dotgrid.grid_x)+"[]"+"]")
    for (var x = dotgrid.grid_x; x >= 0; x--) {
      for (var y = dotgrid.grid_y; y >= 0; y--) {
        let marker = document.createElement("div");
        marker.setAttribute("class",(x % dotgrid.block_x == 0 && y % dotgrid.block_y == 0 ? "marker bm" : "marker bl"));
        marker.style.left = parseInt(x * dotgrid.grid_width + (dotgrid.grid_width/2)) ;
        marker.style.top = parseInt(y * dotgrid.grid_height + (dotgrid.grid_height/2)) ;
        this.el.appendChild(marker);
        this.markers[x][y] = marker
      }
    }
  }
  this.update = function() // it's less than ideal to reuse this much code, but I couldn't find a way to reuse the function that wouldn't mess with the architecture
  {
    for (var x = dotgrid.grid_x; x >= 0; x--) {
      for (var y = dotgrid.grid_y; y >= 0; y--) {
        let marker = this.markers[x][y]
        marker.style.left = parseInt(x * dotgrid.grid_width + (dotgrid.grid_width/2) +(5*dotgrid.scale));
        marker.style.top = parseInt(y * dotgrid.grid_height + (dotgrid.grid_height/2) +(5*dotgrid.scale));
      }
    }
  }
}