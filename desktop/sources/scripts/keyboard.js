function Keyboard()
{
  this.memory = "";

  this.selector = {x:0,y:0};

  this.start = function()
  {
    dotgrid.controller.set("keyboard");
    this.select({x:10,y:10})
    dotgrid.cursor.className = "keyboard";
  }

  this.stop = function()
  {
    dotgrid.controller.set();
    dotgrid.cursor.className = "";
  }

  this.select = function(pos)
  {
    this.selector = {x:pos.x * -dotgrid.grid_width,y:pos.y * dotgrid.grid_height};
    dotgrid.move_cursor(this.selector)
    dotgrid.guide.update();
    dotgrid.draw();
  }

  this.deselect = function()
  {
    dotgrid.tool.clear();
    dotgrid.guide.update();
    dotgrid.draw();
  }

  this.confirm = function()
  {
    dotgrid.tool.add_vertex({x:this.selector.x * -1,y:this.selector.y});
    dotgrid.guide.update();
    dotgrid.draw();
  }

  this.erase = function()
  {
    dotgrid.tool.remove_segments_at(this.selector);
    dotgrid.guide.update();
    dotgrid.draw();
  }

  this.move = function(x,y)
  {
    this.selector = {x:this.selector.x+(x*dotgrid.grid_width),y:this.selector.y+(-y*dotgrid.grid_height)};

    this.selector.x = this.selector.x > 0 ? 0 : this.selector.x;
    this.selector.y = this.selector.y < 0 ? 0 : this.selector.y;
    dotgrid.move_cursor(this.selector)
    dotgrid.guide.update();
    dotgrid.draw();
  }

  this.push = function(k)
  {
    this.memory = `${this.memory}${k}`;
    if(this.memory.length > 3){
      var pos = {x:parseInt(this.memory.substr(0,2)),y:parseInt(this.memory.substr(2,2))};
      this.select(pos);
      this.memory = "";
    }
  }

  this.reset = function()
  {
    this.memory = "";
    dotgrid.update();
  }

  this.listen = function(e)
  {
    if(e.key == "ArrowRight"){
      dotgrid.keyboard.move(-1,0);
      e.preventDefault();
    }
    if(e.key == "ArrowLeft"){
      dotgrid.keyboard.move(1,0);
      e.preventDefault();
    }
    if(e.key == "ArrowUp"){
      dotgrid.keyboard.move(0,1);
      e.preventDefault();
    }
    if(e.key == "ArrowDown"){
      dotgrid.keyboard.move(0,-1);
      e.preventDefault();
    }
    if(e.code && e.code.substr(0,5) == "Digit"){
      var value = parseInt(e.code.substr(5,1));
      dotgrid.keyboard.push(value);
      e.preventDefault();
    }
  }

  // document.onkeyup = function(event){ dotgrid.keyboard.listen(event); };
  document.onkeydown = function(event){ dotgrid.keyboard.listen(event); };
}