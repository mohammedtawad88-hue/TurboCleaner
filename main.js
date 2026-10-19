/**
 * TurboCleaner - Main Electron Process
 */

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const cleaner = require('./engine/cleaner');
const ramBooster = require('./engine/ramBooster');
const startupManager = require('./engine/startupManager');

let mainWindow = null;

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function createWindow() {
  const iconIco = path.join(__dirname, 'assets', 'icon.ico');
  const iconPng = path.join(__dirname, 'assets', 'icon.png');
  const iconPath = fs.existsSync(iconIco) ? iconIco : (fs.existsSync(iconPng) ? iconPng : undefined);

  mainWindow = new BrowserWindow({
    width: 1080,
    height: 720,
    minWidth: 920,
    minHeight: 640,
    title: 'TurboCleaner — Deep PC & RAM Optimizer',
    icon: iconPath,
    frame: false,
    backgroundColor: '#090d16',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC Window Controls
ipcMain.on('window-action', (_e, action) => {
  if (!mainWindow) return;
  if (action === 'minimize') mainWindow.minimize();
  else if (action === 'maximize') {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  } else if (action === 'close') {
    mainWindow.close();
  }
});

// Cleaner IPC Handlers
ipcMain.handle('scan-junk', async () => {
  return await cleaner.scanAllJunk();
});

ipcMain.handle('clean-junk', async (_e, categoryIds) => {
  return await cleaner.cleanJunk(categoryIds);
});

ipcMain.handle('empty-recycle-bin', async () => {
  return await cleaner.emptyRecycleBin();
});

// RAM Booster Handlers
ipcMain.handle('get-ram-stats', () => {
  return ramBooster.getRAMStats();
});

ipcMain.handle('purge-ram', async () => {
  return await ramBooster.purgeRAM();
});

// Startup Apps Handlers
ipcMain.handle('get-startup-apps', async () => {
  return await startupManager.getStartupApps();
});

ipcMain.handle('toggle-startup-app', async (_e, { appName, enable }) => {
  return await startupManager.toggleStartupApp(appName, enable);
});
