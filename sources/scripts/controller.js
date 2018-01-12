function Controller()
{
  this.menu = {default:{}};
  this.mode = "default";

  this.app = require('electron').remote.app;

  this.start = function()
  {
  }

  this.add = function(mode,cat,label,fn,accelerator)
  {
    if(!this.menu[mode]){ this.menu[mode] = {}; }
    if(!this.menu[mode][cat]){ this.menu[mode][cat] = {}; }
    this.menu[mode][cat][label] = {fn:fn,accelerator:accelerator};
    console.log("Added control",mode,cat,label,accelerator)
  }

  this.commit = function()
  {
    var f = [];
    var m = this.menu[this.mode];
    for(cat in m){
      var submenu = [];
      for(name in m[cat]){
        var option = m[cat][name];
        submenu.push({label:name,accelerator:option.accelerator,click:option.fn})
      }
      f.push({label:cat,submenu:submenu});
    }
    this.app.inject_menu(f);
  }
}

module.exports = new Controller();