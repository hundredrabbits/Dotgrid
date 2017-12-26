const {app, BrowserWindow, webFrame, Menu} = require('electron')
const path = require('path')
const url = require('url')
const shell = require('electron').shell

let win

app.on('ready', () => 
{
  win = new BrowserWindow({width: 400, height: 420, minWidth: 400, minHeight: 400, backgroundColor:"#000", frame:false, autoHideMenuBar: true, icon: __dirname + '/icon.ico'})

  win.loadURL(`file://${__dirname}/sources/index.html`)

  let is_shown = true;

  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: 'File', submenu: [
        { label: 'Inspector', accelerator: 'CmdOrCtrl+.', click: () => { win.webContents.openDevTools(); }},
        { label: 'Guide', accelerator: 'CmdOrCtrl+,', click: () => { shell.openExternal('https://github.com/hundredrabbits/Dotgrid'); }},
        { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: () => { force_quit=true; app.exit(); }}
      ]
    },
    { label: 'Window', submenu : [
        { label: 'Hide', accelerator: 'CmdOrCtrl+H',click: () => { if(is_shown){ win.hide(); } else{ win.show(); }}},
        { label: 'Minimize', accelerator: 'CmdOrCtrl+M',click: () => { win.minimize(); }},
        { label: 'Fullscreen', accelerator: 'CmdOrCtrl+Enter',click: () => { win.setFullScreen(win.isFullScreen() ? false : true); }}
      ]
    }
  ]));

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