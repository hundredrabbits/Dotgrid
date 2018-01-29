function Interface()
{
  this.el = document.createElement("div");
  this.el.id = "interface";

  this.start = function()
  {
    document.getElementById("app").appendChild(this.el);

    // Interface
    var html = ""
    var path_arr = [
      ["line","line","M60,60 L240,240",""],
      ["arc_c","arc clockwise","M60,60 A180,180 0 0,1 240,240",""],
      ["arc_r","arc reverse","M60,60 A180,180 0 0,0 240,240",""],
      ["bezier","bezier","M60,60 Q60,150 150,150 Q240,150 240,240 ",""],
      ["close","close","M60,60 A180,180 0 0,1 240,240  M60,60 A180,180 0 0,0 240,240",""],
      
      ["thickness","thickness","M60,60 L240,240","stroke-dasharray: 30,15"],
      ["linecap","linecap","M60,60 L240,240 M240,180 L240,240 M180,240 L240,240"],
      ["mirror","mirror","M60,60 L240,240 M180,120 L210,90 M120,180 L90,210  "],
      ["fill","fill","M60,60 L60,150 L150,150 L240,150 L240,240 Z  "],
      
      ["export","export","M150,50 L50,150 L150,250 L250,150 L150,50 Z"]
    ]
    path_arr.forEach(function(a) {
      html += '<svg id="'+a[0]+'" ar="'+a[0]+'" title="hello" viewBox="0 0 300 300" class="icon" style="'+a[3]+'"><path class="icon_path" d="'+a[2]+'" stroke-linecap: round; stroke-width="12px" fill="none" /><rect ar="'+a[0]+'" width="300" height="300" opacity="0"><title>'+a[1]+'</title></rect></svg>'
    }, this);
    this.el.innerHTML = html
  }

  this.update = function()
  {
    let prev = dotgrid.segments[dotgrid.segments.length-1]

    document.getElementById("line").className.baseVal = !dotgrid.from() || !dotgrid.to() ? "icon inactive" : "icon";
    document.getElementById("arc_c").className.baseVal = !dotgrid.from() || !dotgrid.to() ? "icon inactive" : "icon";
    document.getElementById("arc_r").className.baseVal = !dotgrid.from() || !dotgrid.to() ? "icon inactive" : "icon";
    document.getElementById("bezier").className.baseVal = !dotgrid.from() || !dotgrid.to() || !dotgrid.end() ? "icon inactive" : "icon";
    
    document.getElementById("thickness").className.baseVal = dotgrid.segments.length < 1 ? "icon inactive" : "icon";
    document.getElementById("linecap").className.baseVal = dotgrid.segments.length < 1 ? "icon inactive" : "icon";
    document.getElementById("mirror").className.baseVal = dotgrid.segments.length < 1 ? "icon inactive" : "icon";
    document.getElementById("fill").className.baseVal = dotgrid.segments.length < 1 ? "icon inactive" : "icon";
    document.getElementById("close").className.baseVal = dotgrid.segments.length < 1 || (prev && prev.name == "close") ? "icon inactive" : "icon";
    document.getElementById("export").className.baseVal = dotgrid.segments.length < 1 ? "icon inactive" : "icon";
  }

  this.update_size = function()
  {
    var size = this.zoom ? {width:600,height:600} : {width:300,height:300};

    dotgrid.set_size(size,this.is_visible);
  }

  this.is_visible = true;
  this.zoom = false;

  this.toggle = function()
  {
    this.is_visible = this.is_visible ? false : true;
    this.el.className = this.is_visible ? "visible" : "hidden";

    this.update_size();
  }

  this.toggle_zoom = function()
  {
    this.zoom = this.zoom ? false : true;
    this.update_size();
  }
}
