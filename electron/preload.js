const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),

  // Notifications
  showNotification: (title, body) =>
    ipcRenderer.invoke('show-notification', { title, body }),

  // Dock / Badge
  setBadgeCount: (count) => ipcRenderer.invoke('set-badge-count', count),
  bounceDock: () => ipcRenderer.invoke('bounce-dock'),

  // Progress bar
  setProgressBar: (progress) => ipcRenderer.invoke('set-progress-bar', progress),

  // Navigation from menu
  onNavigate: (callback) => {
    ipcRenderer.on('navigate', (event, route) => callback(route));
  },

  // Menu actions
  onNewTask: (callback) => {
    ipcRenderer.on('new-task', () => callback());
  },
  onNewProject: (callback) => {
    ipcRenderer.on('new-project', () => callback());
  },
  onShowShortcuts: (callback) => {
    ipcRenderer.on('show-shortcuts', () => callback());
  },

  // Check if running in Electron
  isElectron: true,
});
