function Guide()
{
  this.el = document.createElement("canvas");
  this.el.id = "guide";
  this.el.width = 640;
  this.el.height = 640;
  this.el.style.width = "320px";
  this.el.style.height = "320px";

  this.start = function()
  {
    this.clear();
    this.refresh();
  }

  this.toggle = function()
  {
    this.el.style.opacity = !this.el.style.opacity || this.el.style.opacity == 1 ? 0 : 1;
  }

  this.resize = function(size)
  {
    this.el.width = (size.width+40)*2;
    this.el.height = (size.height+40)*2;
    this.el.style.width = (size.width+40)+"px";
    this.el.style.height = (size.height+40)+"px";

    this.refresh();
  }

  this.clear = function()
  {
    this.el.getContext('2d').clearRect(0, 0, this.el.width*2, this.el.height*2);
  }

  this.refresh = function()
  {
    console.log("refresh")
    this.clear();

    // Markers
    for (var x = dotgrid.grid_x; x >= 0; x--) {
      for (var y = dotgrid.grid_y; y >= 0; y--) {
        var pos_x = parseInt(x * dotgrid.grid_width) + dotgrid.grid_width ;
        var pos_y = parseInt(y * dotgrid.grid_height) + dotgrid.grid_height ;
        var is_step = x % dotgrid.block_x == 0 && y % dotgrid.block_y == 0;
        var radius = is_step ? 2.5 : 1.5;
        this.draw_marker({x:pos_x,y:pos_y},radius,is_step);
      }
    }

    // Verteces
    for(id in dotgrid.tool.verteces){
      this.draw_vertex(dotgrid.tool.verteces[id]);
    }

    // Handles
    for(segment_id in dotgrid.tool.layer()){
      var segment = dotgrid.tool.layer()[segment_id];
      for(vertex_id in segment.verteces){
        var vertex = segment.verteces[vertex_id];
        this.draw_handle(vertex);  
      }
    }

    // Translations
    if(dotgrid.cursor.translation){
      this.draw_translation();
    }

    // Cursor
    this.draw_cursor(dotgrid.cursor.pos);  
  }

  this.draw_vertex = function(pos, radius = 5)
  {
    var ctx = this.el.getContext('2d');
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.arc((pos.x * 2)+30, (pos.y * 2)+30, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = dotgrid.theme.active.f_med;
    ctx.fill();
    ctx.closePath();
  }

  this.draw_marker = function(pos,radius = 1,step)
  {
    var ctx = this.el.getContext('2d');
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.arc(pos.x * 2, pos.y * 2, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = step ? dotgrid.theme.active.f_med : dotgrid.theme.active.f_low;
    ctx.fill();
    ctx.closePath();
  }

  this.draw_handle = function(pos,radius = 15)
  {
    var ctx = this.el.getContext('2d');
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.lineCap="round";
    ctx.arc((pos.x * 2)+30, (pos.y * 2)+30, radius, 0, 2 * Math.PI, false);
    ctx.strokeStyle = dotgrid.theme.active.f_low;
    ctx.stroke(); 
    ctx.closePath(); 
  }

  this.draw_translation = function()
  {    
    // From
    var ctx = this.el.getContext('2d');
    var from = dotgrid.cursor.translation.from;
    var to = dotgrid.cursor.translation.to;

    if(to.x<=0) {
      ctx.beginPath();
      ctx.moveTo((from.x * -2)+30,(from.y * 2)+30);
      ctx.lineTo((to.x * -2)+30,(to.y * 2)+30);
      ctx.lineCap="round";
      ctx.lineWidth = 5;
      ctx.strokeStyle = dotgrid.theme.active.b_inv;
      ctx.stroke();
      ctx.closePath();
    }
  }

  this.draw_cursor = function(pos,radius = 10)
  {
    if(!pos || !pos.x || !pos.y){ return; }

    var ctx = this.el.getContext('2d');
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.lineCap="round";
    ctx.arc((pos.x * -2)+30, (pos.y * 2)+30, radius, 0, 2 * Math.PI, false);
    ctx.strokeStyle = dotgrid.theme.active.f_med;
    ctx.stroke(); 
    ctx.closePath(); 
  }
}