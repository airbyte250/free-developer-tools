const { app, BrowserWindow, Menu, Tray, nativeImage, ipcMain, Notification, shell, dialog } = require('electron');
const path = require('path');
const { execSync } = require('child_process');

let mainWindow;
let tray = null;
let isQuitting = false;

// Determine if we're in development or production
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    vibrancy: 'sidebar',
    visualEffectState: 'active',
    backgroundColor: '#f8fafc',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
    },
    icon: path.join(__dirname, '../public/icon.png'),
    show: false,
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // Open DevTools in development
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // macOS: Hide window instead of closing
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      return false;
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  const trayIcon = nativeImage.createFromPath(
    path.join(__dirname, '../public/tray-icon.png')
  ).resize({ width: 16, height: 16 });

  tray = new Tray(trayIcon);
  tray.setToolTip('WorkSpace - Company Management');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open WorkSpace',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Dashboard',
      click: () => navigateTo('/'),
    },
    {
      label: 'Projects',
      click: () => navigateTo('/projects'),
    },
    {
      label: 'Chat',
      click: () => navigateTo('/chat'),
    },
    {
      label: 'AI Agents',
      click: () => navigateTo('/ai-agents'),
    },
    { type: 'separator' },
    {
      label: 'New Task',
      accelerator: 'CmdOrCtrl+N',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.webContents.send('new-task');
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quit WorkSpace',
      accelerator: 'CmdOrCtrl+Q',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    }
  });
}

function navigateTo(route) {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.send('navigate', route);
  }
}

function createMenu() {
  const template = [
    {
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        {
          label: 'Preferences...',
          accelerator: 'CmdOrCtrl+,',
          click: () => navigateTo('/settings'),
        },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        {
          label: 'Quit WorkSpace',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            isQuitting = true;
            app.quit();
          },
        },
      ],
    },
    {
      label: 'File',
      submenu: [
        {
          label: 'New Task',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            if (mainWindow) mainWindow.webContents.send('new-task');
          },
        },
        {
          label: 'New Project',
          accelerator: 'CmdOrCtrl+Shift+N',
          click: () => {
            if (mainWindow) mainWindow.webContents.send('new-project');
          },
        },
        { type: 'separator' },
        { role: 'close' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Dashboard',
          accelerator: 'CmdOrCtrl+1',
          click: () => navigateTo('/'),
        },
        {
          label: 'Projects',
          accelerator: 'CmdOrCtrl+2',
          click: () => navigateTo('/projects'),
        },
        {
          label: 'Team',
          accelerator: 'CmdOrCtrl+3',
          click: () => navigateTo('/team'),
        },
        {
          label: 'Chat',
          accelerator: 'CmdOrCtrl+4',
          click: () => navigateTo('/chat'),
        },
        {
          label: 'AI Agents',
          accelerator: 'CmdOrCtrl+5',
          click: () => navigateTo('/ai-agents'),
        },
        {
          label: 'Browser',
          accelerator: 'CmdOrCtrl+6',
          click: () => navigateTo('/browser'),
        },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Navigate',
      submenu: [
        {
          label: 'Calendar',
          accelerator: 'CmdOrCtrl+7',
          click: () => navigateTo('/calendar'),
        },
        {
          label: 'Time Tracking',
          accelerator: 'CmdOrCtrl+8',
          click: () => navigateTo('/time-tracking'),
        },
        {
          label: 'Reports',
          accelerator: 'CmdOrCtrl+9',
          click: () => navigateTo('/reports'),
        },
        {
          label: 'Documents',
          click: () => navigateTo('/documents'),
        },
        {
          label: 'Attendance',
          click: () => navigateTo('/attendance'),
        },
        {
          label: 'Goals & OKRs',
          click: () => navigateTo('/goals'),
        },
        { type: 'separator' },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => navigateTo('/settings'),
        },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' },
      ],
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'About WorkSpace',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'WorkSpace',
              message: 'WorkSpace - Company Management Platform',
              detail: `Version: ${app.getVersion()}\nElectron: ${process.versions.electron}\nChrome: ${process.versions.chrome}\nNode.js: ${process.versions.node}\n\nA complete workspace solution for managing teams, projects, and productivity.`,
            });
          },
        },
        {
          label: 'Keyboard Shortcuts',
          accelerator: 'CmdOrCtrl+/',
          click: () => {
            if (mainWindow) mainWindow.webContents.send('show-shortcuts');
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC Handlers
ipcMain.handle('get-app-version', () => app.getVersion());

ipcMain.handle('show-notification', (event, { title, body }) => {
  if (Notification.isSupported()) {
    const notification = new Notification({ title, body });
    notification.show();
    notification.on('click', () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    });
  }
});

ipcMain.handle('set-badge-count', (event, count) => {
  if (process.platform === 'darwin') {
    app.setBadgeCount(count);
  }
});

ipcMain.handle('bounce-dock', () => {
  if (process.platform === 'darwin') {
    app.dock.bounce('informational');
  }
});

ipcMain.handle('set-progress-bar', (event, progress) => {
  if (mainWindow) {
    mainWindow.setProgressBar(progress);
  }
});

ipcMain.handle('get-platform', () => process.platform);

// App lifecycle
app.whenReady().then(() => {
  createWindow();
  createMenu();
  createTray();

  // macOS: Re-create window when dock icon clicked
  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    } else {
      mainWindow.show();
    }
  });
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Set app name for macOS
app.setName('WorkSpace');

// Handle certificate errors for development
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (isDev) {
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});
