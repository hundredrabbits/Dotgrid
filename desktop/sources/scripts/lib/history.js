function History()
{
  this.index = 0;
  this.a = [];

  this.clear = function()
  {
    this.a = [];
    this.index = 0;
  }

  this.push = function(data)
  {
    if(this.index < this.a.length-1){
      this.fork();
    }
    this.index = this.a.length;
    this.a = this.a.slice(0,this.index);
    this.a.push(copy(data));

    if(this.a.length > 20){
      this.a.shift();
    }
  }

  this.fork = function()
  {
    this.a = this.a.slice(0,this.index+1);
  }

  this.pop = function()
  {
    return this.a.pop();
  }

  this.prev = function()
  {
    this.index = clamp(this.index-1,0,this.a.length-1);
    return copy(this.a[this.index]);
  }

  this.next = function()
  {
    this.index = clamp(this.index+1,0,this.a.length-1);
    return copy(this.a[this.index]);
  }

  function copy(data){ return data ? JSON.parse(JSON.stringify(data)) : []; }
  function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }
}