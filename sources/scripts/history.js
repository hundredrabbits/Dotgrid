function History()
{
  this.index = 0;
  this.a = [];

  this.push = function(data)
  {
    var d = data.slice(0);
    if(this.index != this.a.length){
      this.a = this.a.slice(0,this.index);
    }
    this.a.push(d);
    this.index = this.a.length;
    console.log(`history: ${this.index}/${this.a.length}`)
  }

  this.pop = function()
  {
    console.log(`history: ${this.index}/${this.a.length}`)
    return this.a.pop();
  }

  this.prev = function()
  {
    this.index = clamp(this.index-1,0,this.a.length-1);
    console.log(`history: ${this.index}/${this.a.length}`)
    return this.a[this.index].slice(0);
  }

  this.next = function()
  {
    this.index = clamp(this.index+1,0,this.a.length-1);
    console.log(`history: ${this.index}/${this.a.length}`)
    return this.a[this.index].slice(0);
  }

  function copy(data){ return JSON.parse(JSON.stringify(data)); }

  function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }
}