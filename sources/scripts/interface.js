function Interface()
{
  this.el = document.createElement("div");
  this.el.id = "interface";
  this.is_visible = true;

  this.start = function()
  {
    document.body.appendChild(this.el);

    // Interface
    var html = ""
    var path_arr = [
      ["line","line (d)","M60,60 L240,240",""],
      ["arc_c","arc clockwise (s)","M60,60 A180,180 0 0,1 240,240",""],
      ["arc_r","arc reverse (a)","M60,60 A180,180 0 0,0 240,240",""],
      ["bezier","bezier (f)","M60,60 Q60,150 150,150 Q240,150 240,240 ",""],
      ["close","close (g)","M60,60 A180,180 0 0,1 240,240  M60,60 A180,180 0 0,0 240,240",""],
      
      ["thickness","thickness ([ & ])","M60,60 L240,240","stroke-dasharray: 30,15"],
      ["linecap","linecap (/)","M60,60 L240,240  M240,180 L240,240  M180,240 L240,240"],
      ["mirror","mirror (space)","M60,60 L240,240  M180,120 L210,90  M120,180 L90,210  "],
      
      ["export","export (ctrl s)","M150,50 L50,150 L150,250 L250,150 L150,50 Z"]
    ]
    path_arr.forEach(function(a) {
      html+='<svg id="'+a[0]+'" ar="'+a[0]+'" title="hello" viewBox="0 0 300 300" class="icon" style="'+a[3]+'"><path class="icon_path" d="'+a[2]+'" stroke-linecap: round; stroke-width="12px" fill="none" /><rect ar="'+a[0]+'" width="300" height="300" opacity="0"><title>'+a[1]+'</title></rect></svg>'
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
    document.getElementById("close").className.baseVal = dotgrid.segments.length < 1 || (prev && prev.name == "close") ? "icon inactive" : "icon";
    document.getElementById("export").className.baseVal = dotgrid.segments.length < 1 ? "icon inactive" : "icon";
  }

  this.toggle = function()
  {
    this.is_visible = this.is_visible ? false : true;
    this.el.className = this.is_visible ? "visible" : "hidden";


    const {dialog,app} = require('electron').remote;
    var win = require('electron').remote.getCurrentWindow();
    win.setSize(900,this.is_visible ? 420 : 400);
  }
}