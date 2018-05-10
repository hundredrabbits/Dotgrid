function Guide()
{
  this.el = document.createElement("canvas");
  this.el.id = "guide";
  this.el.width = 640;
  this.el.height = 640;
  this.el.style.width = "320px";
  this.el.style.height = "320px";

  var scale = 2;

  this.start = function()
  {
    this.clear();
    this.refresh();
  }
  
  this.refresh = function()
  {
    this.clear();
    this.draw_markers()
    this.draw_vertices()
    this.draw_handles()
    this.draw_paths()
    this.draw_overlays()
    this.draw_translation();
    this.draw_cursor();  
    this.draw_preview();
  }

  this.clear = function()
  {
    this.el.getContext('2d').clearRect(0, 0, this.el.width*scale, this.el.height*scale);
  }

  this.toggle = function()
  {
    this.el.style.opacity = !this.el.style.opacity || this.el.style.opacity == 1 ? 0 : 1;
  }

  this.resize = function(size)
  {
    var offset = 30
    this.el.width = (size.width+offset)*scale;
    this.el.height = (size.height+offset)*scale;
    this.el.style.width = (size.width+offset)+"px";
    this.el.style.height = (size.height+offset)+"px";

    this.refresh();
  }


  this.draw_overlays = function()
  {
    for(segment_id in dotgrid.tool.layer()){
      var segment = dotgrid.tool.layer()[segment_id];
      for(vertex_id in segment.vertices){
        var vertex = segment.vertices[vertex_id];
        this.draw_vertex(vertex,3);
      }
    }
  }

  this.draw_handles = function()
  {
    for(segment_id in dotgrid.tool.layer()){
      var segment = dotgrid.tool.layer()[segment_id];
      for(vertex_id in segment.vertices){
        var vertex = segment.vertices[vertex_id];
        this.draw_handle(vertex);  
      }
    }
  }

  this.draw_vertices = function()
  {
    for(id in dotgrid.tool.vertices){
      this.draw_vertex(dotgrid.tool.vertices[id]);
    }
  }

  this.draw_markers = function()
  {
    for (var x = dotgrid.grid_x; x >= 0; x--) {
      for (var y = dotgrid.grid_y; y >= 0; y--) {
        var pos_x = parseInt(x * dotgrid.grid_width) + dotgrid.grid_width ;
        var pos_y = parseInt(y * dotgrid.grid_height) + dotgrid.grid_height ;
        var is_step = x % dotgrid.block_x == 0 && y % dotgrid.block_y == 0;
        var radius = is_step ? 2.5 : 1.5;
        this.draw_marker({x:pos_x,y:pos_y},radius,is_step);
      }
    }
  }

  this.draw_vertex = function(pos, radius = 5)
  {
    var ctx = this.el.getContext('2d');
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.arc((pos.x * scale)+30, (pos.y * scale)+30, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = dotgrid.theme.active.f_med;
    ctx.fill();
    ctx.closePath();
  }

  this.draw_marker = function(pos,radius = 1,step)
  {
    var ctx = this.el.getContext('2d');
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.arc(pos.x * scale, pos.y * scale, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = step ? dotgrid.theme.active.f_med : dotgrid.theme.active.f_low;
    ctx.fill();
    ctx.closePath();
  }

  this.draw_paths = function()
  {
    var path = new Generator(dotgrid.tool.layer()).toString({x:15,y:15},scale)
    var style = dotgrid.tool.style()

    this.draw_path(path,style)
  }

  this.draw_path = function(path,style)
  {
    var ctx = this.el.getContext('2d');
    var p = new Path2D(path);

    ctx.setLineDash([0,0]); 

    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.thickness * scale;
    ctx.lineCap = style.strokeLinecap;
    ctx.lineJoin = style.strokeLinejoin;

    if(style.fill && style.fill != "none"){
      ctx.fillStyle = style.color
      ctx.fill(p);
    }
    if(style.strokeLineDash){
      ctx.setLineDash(style.strokeLineDash);
    }

    ctx.stroke(p);
  }

  this.draw_handle = function(pos,radius = 15)
  {
    var ctx = this.el.getContext('2d');
    ctx.beginPath();
    ctx.setLineDash([0,0]); 
    ctx.lineWidth = 3;
    ctx.lineCap="round";
    ctx.arc((pos.x * scale)+30, (pos.y * scale)+30, radius, 0, 2 * Math.PI, false);
    ctx.strokeStyle = pos_is_equal(pos,dotgrid.cursor.pos) ? dotgrid.theme.active.b_inv : dotgrid.theme.active.f_low;
    ctx.stroke(); 
    ctx.closePath(); 
  }

  this.draw_translation = function()
  {   
    if(!dotgrid.cursor.translation){ return; }
    // From
    var ctx = this.el.getContext('2d');
    var from = dotgrid.cursor.translation.from;
    var to = dotgrid.cursor.translation.to;

    if(to.x<=0) {
      ctx.beginPath();
      ctx.setLineDash([0,0]); 
      ctx.moveTo((from.x * -scale)+30,(from.y * scale)+30);
      ctx.lineTo((to.x * -scale)+30,(to.y * scale)+30);
      ctx.lineCap="round";
      ctx.lineWidth = 5;
      ctx.strokeStyle = dotgrid.theme.active.b_inv;
      ctx.stroke();
      ctx.closePath();
    }
  }

  this.draw_cursor = function(pos = dotgrid.cursor.pos,radius = 10)
  {
    var ctx = this.el.getContext('2d');
    ctx.beginPath();
    ctx.setLineDash([0,0]); 
    ctx.lineWidth = 3;
    ctx.lineCap="round";
    ctx.arc(Math.abs(pos.x * -scale)+30, Math.abs(pos.y * scale)+30, radius, 0, 2 * Math.PI, false);
    ctx.strokeStyle = dotgrid.theme.active.f_med;
    ctx.stroke(); 
    ctx.closePath(); 
  }

  this.draw_preview = function()
  {
    var operation = dotgrid.cursor.operation

    if(!dotgrid.tool.can_cast(operation)){ return; }
    if(operation == "close"){ return; }

    var path  = new Generator([{vertices:dotgrid.tool.vertices,type:operation}]).toString({x:15,y:15},2)
    var style = {
      color:"#f00",
      thickness:2,
      strokeLinecap:"round",
      strokeLinejoin:"round",
      strokeLineDash:[5, 15]
    }

    this.draw_path(path,style)
  }

  function pos_is_equal(a,b){ return a && b && Math.abs(a.x) == Math.abs(b.x) && Math.abs(a.y) == Math.abs(b.y) }
}
