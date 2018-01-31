function History()
{
  this.index = 0;
  this.a = [];

  this.push = function(data)
  {
    if(this.index < this.a.length-1){
      this.fork();
    }
    this.index = this.a.length;
    this.a = this.a.slice(0,this.index);
    this.a.push(copy(data));
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

  function copy(data){ return data.slice(0); }
  function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }
}