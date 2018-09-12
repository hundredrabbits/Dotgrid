'use strict';

function Interface()
{
  this.el = document.createElement("div");
  this.el.id = "interface";

  this.el.appendChild(this.menu_el = document.createElement("div"));
  this.menu_el.id = "menu";

  this.is_visible = true;
  this.zoom = false;

  this.start = function()
  {
    document.getElementById("app").appendChild(this.el);
    this.el.appendChild(dotgrid.picker.el);
    
    let html = ""
    let options = {
      cast:{
        line: { key:"A",icon:"M60,60 L240,240" },
        arc_c: { key:"S",icon:"M60,60 A180,180 0 0,1 240,240" },
        arc_r: { key:"D",icon:"M60,60 A180,180 0 0,0 240,240" },
        bezier: { key:"F",icon:"M60,60 Q60,150 150,150 Q240,150 240,240" },
        close: { key:"Z",icon:"M60,60 A180,180 0 0,1 240,240  M60,60 A180,180 0 0,0 240,240" }
      },
      toggle:{
        linecap: { key:"Q",icon:"M60,60 L60,60 L180,180 L240,180 L240,240 L180,240 L180,180" },
        linejoin: { key:"W",icon:"M60,60 L120,120 L180,120  M120,180 L180,180 L240,240" },
        thickness: { key:"",icon:"M120,90 L120,90 L90,120 L180,210 L210,180 Z M105,105 L105,105 L60,60 M195,195 L195,195 L240,240" }, 
        mirror: { key:"E",icon:"M60,60 L60,60 L120,120 M180,180 L180,180 L240,240 M210,90 L210,90 L180,120 M120,180 L120,180 L90,210" },
        fill: { key:"R",icon:"M60,60 L60,150 L150,150 L240,150 L240,240 Z" }
      },
      misc:{
        color: { key:"G",icon:"M150,60 A90,90 0 0,1 240,150 A-90,90 0 0,1 150,240 A-90,-90 0 0,1 60,150 A90,-90 0 0,1 150,60"}
      },
      source:{
        open: { key:"", icon:"M155,65 A90,90 0 0,1 245,155 A90,90 0 0,1 155,245 A90,90 0 0,1 65,155 A90,90 0 0,1 155,65 M155,95 A60,60 0 0,1 215,155 A60,60 0 0,1 155,215 A60,60 0 0,1 95,155 A60,60 0 0,1 155,95 "},
        render: { key:"", icon:"M155,65 A90,90 0 0,1 245,155 A90,90 0 0,1 155,245 A90,90 0 0,1 65,155 A90,90 0 0,1 155,65 M110,155 L110,155 L200,155 "},
        export: { key:"", icon:"M155,65 A90,90 0 0,1 245,155 A90,90 0 0,1 155,245 A90,90 0 0,1 65,155 A90,90 0 0,1 155,65 M110,140 L110,140 L200,140 M110,170 L110,170 L200,170"},
        save: { key:"", icon:"M155,65 A90,90 0 0,1 245,155 A90,90 0 0,1 155,245 A90,90 0 0,1 65,155 A90,90 0 0,1 155,65 M110,155 L110,155 L200,155 M110,185 L110,185 L200,185 M110,125 L110,125 L200,125"},
        grid: { key:"H", icon:"M65,155 Q155,245 245,155 M65,155 Q155,65 245,155 M155,125 A30,30 0 0,1 185,155 A30,30 0 0,1 155,185 A30,30 0 0,1 125,155 A30,30 0 0,1 155,125 "},
      }      
    }

    for(let type in options){
      let tools = options[type];
      for(let name in tools){
        let tool = tools[name];
        html += `
        <svg 
          id="option_${name}" 
          title="${name.capitalize()}" 
          onmouseout="dotgrid.interface.out('${type}','${name}')" 
          onmouseup="dotgrid.interface.up('${type}','${name}')" 
          onmousedown="dotgrid.interface.down('${type}','${name}')" 
          onclick="dotgrid.interface.click('${type}','${name}')" 
          onmouseover="dotgrid.interface.over('${type}','${name}')" 
          viewBox="0 0 300 300" 
          class="icon ${type}">
          <path id="${name}_path" class="icon_path" d="${tool.icon}"/>${name == "depth" ? `<path class="icon_path inactive" d=""/>` : ""}
          <rect ar="${name}" width="300" height="300" opacity="0">
            <title>${name.capitalize()}${tool.key ? '('+tool.key+')' : ''}</title>
          </rect>
        </svg>`
      }
      
    }
    this.menu_el.innerHTML = html
  }

  this.over = function(type,name)
  {
    dotgrid.cursor.operation = {}
    dotgrid.cursor.operation[type] = name;
  }

  this.out = function(type,name)
  {
    dotgrid.cursor.operation = ""
  }

  this.up = function(type,name)
  {
    if(!dotgrid.tool[type]){ console.warn(`Unknown option(type): ${type}.${name}`,dotgrid.tool); return; }

    this.update(true);
  }

  this.down = function(type,name)
  {
    if(!dotgrid.tool[type]){ console.warn(`Unknown option(type): ${type}.${name}`,dotgrid.tool); return; }

    dotgrid.tool[type](name)
    this.update(true);
  }

  this.click = function(type,name)
  {
    // if(!dotgrid.tool[type]){ console.warn(`Unknown option(type): ${type}.${name}`,dotgrid.tool); return; }

    // dotgrid.tool[type](name)
    // this.update();
  }

  this.prev_operation = null;

  this.update = function(force = false,id)
  {
    if(this.prev_operation == dotgrid.cursor.operation && force == false){ return; }

    let multi_vertices = null;
    let segments = dotgrid.tool.layer()
    let sum_segments = dotgrid.tool.length();

    for(let i in segments){
      if(segments[i].vertices.length > 2){ multi_vertices = true; break; }
    }

    document.getElementById("option_line").className.baseVal = !dotgrid.tool.can_cast("line") ? "icon inactive" : "icon";
    document.getElementById("option_arc_c").className.baseVal = !dotgrid.tool.can_cast("arc_c") ? "icon inactive" : "icon";
    document.getElementById("option_arc_r").className.baseVal = !dotgrid.tool.can_cast("arc_r") ? "icon inactive" : "icon";
    document.getElementById("option_bezier").className.baseVal = !dotgrid.tool.can_cast("bezier") ? "icon inactive" : "icon";
    document.getElementById("option_close").className.baseVal = !dotgrid.tool.can_cast("close") ? "icon inactive" : "icon";
    
    document.getElementById("option_thickness").className.baseVal = dotgrid.tool.layer().length < 1 ? "icon inactive" : "icon";
    document.getElementById("option_linecap").className.baseVal = dotgrid.tool.layer().length < 1 ? "icon inactive" : "icon";
    document.getElementById("option_linejoin").className.baseVal = dotgrid.tool.layer().length < 1 || !multi_vertices ? "icon inactive" : "icon";
    document.getElementById("option_mirror").className.baseVal = dotgrid.tool.layer().length < 1 ? "icon inactive" : "icon";
    document.getElementById("option_fill").className.baseVal = dotgrid.tool.layer().length < 1 ? "icon inactive" : "icon";
    
    document.getElementById("option_color").children[0].style.fill = dotgrid.tool.style().color;
    document.getElementById("option_color").children[0].style.stroke = dotgrid.tool.style().color;
    document.getElementById("option_color").className.baseVal = "icon";

    // Source

    document.getElementById("option_save").className.baseVal = sum_segments < 1 ? "icon inactive source" : "icon source";
    document.getElementById("option_export").className.baseVal = sum_segments < 1 ? "icon inactive source" : "icon source";
    document.getElementById("option_render").className.baseVal = sum_segments < 1 ? "icon inactive source" : "icon source";

    document.getElementById("option_grid").className.baseVal = dotgrid.guide.show_extras ? "icon inactive source" : "icon source";
    
    // Grid
    if(dotgrid.guide.show_extras){ document.getElementById("grid_path").setAttribute("d","M65,155 Q155,245 245,155 M65,155 Q155,65 245,155 M155,125 A30,30 0 0,1 185,155 A30,30 0 0,1 155,185 A30,30 0 0,1 125,155 A30,30 0 0,1 155,125 ") }
    else{ document.getElementById("grid_path").setAttribute("d","M65,155 Q155,245 245,155 M65,155 ") }

    // Mirror
    if(dotgrid.tool.style().mirror_style == 0){ document.getElementById("mirror_path").setAttribute("d","M60,60 L60,60 L120,120 M180,180 L180,180 L240,240 M210,90 L210,90 L180,120 M120,180 L120,180 L90,210") }
    else if(dotgrid.tool.style().mirror_style == 1){ document.getElementById("mirror_path").setAttribute("d","M60,60 L240,240 M180,120 L210,90 M120,180 L90,210") }
    else if(dotgrid.tool.style().mirror_style == 2){ document.getElementById("mirror_path").setAttribute("d","M210,90 L210,90 L90,210 M60,60 L60,60 L120,120 M180,180 L180,180 L240,240") }
    else if(dotgrid.tool.style().mirror_style == 3){ document.getElementById("mirror_path").setAttribute("d","M60,60 L60,60 L120,120 L120,120 L180,120 M120,150 L120,150 L180,150 M120,180 L120,180 L180,180 L180,180 L240,240 ") }
    else if(dotgrid.tool.style().mirror_style == 4){ document.getElementById("mirror_path").setAttribute("d","M120,120 L120,120 L120,120 L180,120 M120,150 L120,150 L180,150 M120,180 L120,180 L180,180 L180,180 L180,180 L240,240 M120,210 L120,210 L180,210 M120,90 L120,90 L180,90 M60,60 L60,60 L120,120  ") }

    this.prev_operation = dotgrid.cursor.operation;
  }

  this.toggle = function()
  {
    this.is_visible = this.is_visible ? false : true;
    this.el.className = this.is_visible ? "visible" : "hidden";
  }
}
