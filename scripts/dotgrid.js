function Dotgrid(width,height)
{
  this.width = width;
  this.height = height;
  this.element = null;

  this.install = function()
  {
    this.element = document.createElement("div");
    this.element.id = "dotgrid";
    this.element.style.width = this.width;
    this.element.style.height = this.height;
    document.body.appendChild(this.element);
  }
}