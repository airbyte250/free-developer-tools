const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),

  // Notifications
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', { title, body }),

  // Dock / Badge
  setBadgeCount: (count) => ipcRenderer.invoke('set-badge-count', count),
  bounceDock: () => ipcRenderer.invoke('bounce-dock'),

  // Progress bar
  setProgressBar: (progress) => ipcRenderer.invoke('set-progress-bar', progress),

  // Navigation from menu
  onNavigate: (callback) => { ipcRenderer.on('navigate', (event, route) => callback(route)); },

  // Menu actions
  onNewTask: (callback) => { ipcRenderer.on('new-task', () => callback()); },
  onNewProject: (callback) => { ipcRenderer.on('new-project', () => callback()); },
  onShowShortcuts: (callback) => { ipcRenderer.on('show-shortcuts', () => callback()); },

  // ======================== BROWSER PROFILE APIs ========================

  // Profile management
  browserCreateProfile: (profileId, name, partition) =>
    ipcRenderer.invoke('browser-create-profile', { profileId, name, partition }),
  browserDeleteProfile: (profileId) =>
    ipcRenderer.invoke('browser-delete-profile', { profileId }),

  // Navigation
  browserNavigate: (profileId, url) =>
    ipcRenderer.invoke('browser-navigate', { profileId, url }),
  browserGoBack: (profileId) =>
    ipcRenderer.invoke('browser-go-back', { profileId }),
  browserGoForward: (profileId) =>
    ipcRenderer.invoke('browser-go-forward', { profileId }),
  browserReload: (profileId) =>
    ipcRenderer.invoke('browser-reload', { profileId }),
  browserGetUrl: (profileId) =>
    ipcRenderer.invoke('browser-get-url', { profileId }),
  browserCanNavigate: (profileId) =>
    ipcRenderer.invoke('browser-can-navigate', { profileId }),

  // View management
  browserShow: (profileId, bounds) =>
    ipcRenderer.invoke('browser-show', { profileId, bounds }),
  browserHide: () =>
    ipcRenderer.invoke('browser-hide'),
  browserSetBounds: (profileId, bounds) =>
    ipcRenderer.invoke('browser-set-bounds', { profileId, bounds }),

  // Open new window
  browserOpenWindow: (profileId, url) =>
    ipcRenderer.invoke('browser-open-window', { profileId, url }),

  // AI Browser Agent
  browserExecuteJs: (profileId, code) =>
    ipcRenderer.invoke('browser-execute-js', { profileId, code }),
  browserGetPageContent: (profileId) =>
    ipcRenderer.invoke('browser-get-page-content', { profileId }),
  browserFillForm: (profileId, selector, value) =>
    ipcRenderer.invoke('browser-fill-form', { profileId, selector, value }),
  browserClick: (profileId, selector) =>
    ipcRenderer.invoke('browser-click', { profileId, selector }),
  browserScreenshot: (profileId) =>
    ipcRenderer.invoke('browser-screenshot', { profileId }),

  // Events from main process
  onBrowserNavigated: (callback) => {
    ipcRenderer.on('browser-navigated', (event, data) => callback(data));
  },
  onBrowserTitleUpdated: (callback) => {
    ipcRenderer.on('browser-title-updated', (event, data) => callback(data));
  },
  onBrowserLoading: (callback) => {
    ipcRenderer.on('browser-loading', (event, data) => callback(data));
  },
  onWindowResized: (callback) => {
    ipcRenderer.on('window-resized', (event, data) => callback(data));
  },

  // Check if running in Electron
  isElectron: true,
});
