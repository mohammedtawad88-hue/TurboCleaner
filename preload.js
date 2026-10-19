const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('turboCleaner', {
  scanJunk: () => ipcRenderer.invoke('scan-junk'),
  cleanJunk: (categoryIds) => ipcRenderer.invoke('clean-junk', categoryIds),
  emptyRecycleBin: () => ipcRenderer.invoke('empty-recycle-bin'),

  getRAMStats: () => ipcRenderer.invoke('get-ram-stats'),
  purgeRAM: () => ipcRenderer.invoke('purge-ram'),

  getStartupApps: () => ipcRenderer.invoke('get-startup-apps'),
  toggleStartupApp: (appName, enable) => ipcRenderer.invoke('toggle-startup-app', { appName, enable }),

  windowAction: (action) => ipcRenderer.send('window-action', action)
});
