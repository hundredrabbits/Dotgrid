const {app, BrowserWindow, webFrame, Menu} = require('electron')
const path = require('path')
const url = require('url')
const shell = require('electron').shell

let win
let is_shown = true;

app.inspect = function()
{
  this.win.webContents.openDevTools(); 
}

app.toggle_fullscreen = function()
{
  win.setFullScreen(win.isFullScreen() ? false : true);
}

app.toggle_visible = function()
{
  if(is_shown){ win.hide(); } else{ win.show(); }
}

app.inject_menu = function(m)
{
  Menu.setApplicationMenu(Menu.buildFromTemplate(m));
}

app.win = win;

app.on('ready', () => 
{
  win = new BrowserWindow({width: 400, height: 420, minWidth: 400, minHeight: 400, backgroundColor:"#000", frame:false, autoHideMenuBar: true, icon: __dirname + '/icon.ico'})

  win.loadURL(`file://${__dirname}/sources/index.html`);

  win.on('closed', () => {
    win = null
    app.quit()
  })

  win.on('hide',function() {
    is_shown = false;
  })

  win.on('show',function() {
    is_shown = true;
  })
})

app.on('window-all-closed', () => 
{
  app.quit()
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
  else{
    
  }
})