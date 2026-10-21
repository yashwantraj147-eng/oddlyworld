const { app, BrowserWindow, ipcMain, shell, Menu } = require('electron');
const path = require('path');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'ODDLYWORLD: The Infinite Toybox',
    backgroundColor: '#0c0e14',
    frame: true,
    titleBarStyle: 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
    show: false,
  });

  const prodPath = path.join(__dirname, '../dist/index.html');
  const isDev = process.argv.includes('--dev');

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173').catch(() => {
      mainWindow.loadFile(prodPath);
    });
  } else {
    mainWindow.loadFile(prodPath);
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Custom application menu
  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        { label: 'New Toybox World', accelerator: 'CmdOrCtrl+N', click: () => mainWindow.webContents.send('menu-action', 'new-world') },
        { label: 'Open World Gallery', accelerator: 'CmdOrCtrl+O', click: () => mainWindow.webContents.send('menu-action', 'open-gallery') },
        { type: 'separator' },
        { label: 'Save Checkpoint', accelerator: 'CmdOrCtrl+S', click: () => mainWindow.webContents.send('menu-action', 'save-world') },
        { label: 'Take World Snapshot', accelerator: 'CmdOrCtrl+Shift+S', click: () => mainWindow.webContents.send('menu-action', 'snapshot') },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', click: () => mainWindow.webContents.send('menu-action', 'undo') },
        { label: 'Redo', accelerator: 'CmdOrCtrl+Y', click: () => mainWindow.webContents.send('menu-action', 'redo') },
        { type: 'separator' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', click: () => mainWindow.webContents.send('menu-action', 'select-all') },
        { label: 'Delete Selected', accelerator: 'Delete', click: () => mainWindow.webContents.send('menu-action', 'delete') },
      ]
    },
    {
      label: 'Simulation',
      submenu: [
        { label: 'Play / Pause', accelerator: 'Space', click: () => mainWindow.webContents.send('menu-action', 'toggle-sim') },
        { label: 'Step Forward', accelerator: 'Period', click: () => mainWindow.webContents.send('menu-action', 'step-sim') },
        { label: 'Speed: 1x', accelerator: '1', click: () => mainWindow.webContents.send('menu-action', 'speed-1') },
        { label: 'Speed: 2x', accelerator: '2', click: () => mainWindow.webContents.send('menu-action', 'speed-2') },
        { label: 'Speed: 5x', accelerator: '3', click: () => mainWindow.webContents.send('menu-action', 'speed-5') },
        { type: 'separator' },
        { label: 'Reset Contraptions', accelerator: 'R', click: () => mainWindow.webContents.send('menu-action', 'reset-contraptions') },
        { label: 'The Chaos Engine', accelerator: 'CmdOrCtrl+K', click: () => mainWindow.webContents.send('menu-action', 'open-chaos') }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Focus Fit-to-World', accelerator: 'F', click: () => mainWindow.webContents.send('menu-action', 'fit-world') },
        { label: 'Top-down Camera', accelerator: 'CmdOrCtrl+1', click: () => mainWindow.webContents.send('menu-action', 'cam-top') },
        { label: 'Isometric Camera', accelerator: 'CmdOrCtrl+2', click: () => mainWindow.webContents.send('menu-action', 'cam-iso') },
        { label: 'Photo Studio Mode', accelerator: 'P', click: () => mainWindow.webContents.send('menu-action', 'photo-mode') },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Playground',
      submenu: [
        { label: 'Creature Creator Lab', accelerator: 'CmdOrCtrl+C', click: () => mainWindow.webContents.send('menu-action', 'open-creature-creator') },
        { label: 'Field Naturalist Journal', accelerator: 'CmdOrCtrl+J', click: () => mainWindow.webContents.send('menu-action', 'open-journal') },
        { label: 'Temporal Time Machine', accelerator: 'CmdOrCtrl+T', click: () => mainWindow.webContents.send('menu-action', 'open-timemachine') },
        { label: 'Curated Challenges', accelerator: 'CmdOrCtrl+G', click: () => mainWindow.webContents.send('menu-action', 'open-challenges') },
      ]
    },
    {
      label: 'Help',
      submenu: [
        { label: 'Oddlyworld Field Guide & Controls', accelerator: 'F1', click: () => mainWindow.webContents.send('menu-action', 'open-help') },
        { label: 'About ODDLYWORLD', click: () => mainWindow.webContents.send('menu-action', 'about') }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
