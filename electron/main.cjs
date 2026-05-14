const { app, BrowserWindow, BrowserView, Menu, Tray, nativeImage, ipcMain, Notification, shell, dialog, session } = require('electron');
const path = require('path');

let mainWindow;
let tray = null;
let isQuitting = false;

// Browser profile management
const browserViews = new Map(); // profileId -> BrowserView
let activeBrowserViewId = null;
const browserProfiles = new Map(); // profileId -> { name, partition, ... }

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

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

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

  // Handle resize to reposition browser views
  mainWindow.on('resize', () => {
    if (activeBrowserViewId && browserViews.has(activeBrowserViewId)) {
      const view = browserViews.get(activeBrowserViewId);
      const bounds = mainWindow.getContentBounds();
      // Send resize event to renderer so it can tell us the browser area bounds
      mainWindow.webContents.send('window-resized', { width: bounds.width, height: bounds.height });
    }
  });
}

// ======================== BROWSER VIEW MANAGEMENT ========================

function createBrowserProfile(profileId, name, partitionName) {
  const partition = `persist:${partitionName || profileId}`;
  browserProfiles.set(profileId, { name, partition, createdAt: new Date().toISOString() });
  return { profileId, name, partition };
}

function createBrowserView(profileId, url) {
  if (!mainWindow) return null;

  const profile = browserProfiles.get(profileId);
  if (!profile) return null;

  // Create session partition for this profile (independent cookies, cache, storage)
  const ses = session.fromPartition(profile.partition);

  const view = new BrowserView({
    webPreferences: {
      partition: profile.partition,
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  });

  browserViews.set(profileId, view);

  // Handle navigation events
  view.webContents.on('did-navigate', (event, navUrl) => {
    if (mainWindow) {
      mainWindow.webContents.send('browser-navigated', { profileId, url: navUrl, title: view.webContents.getTitle() });
    }
  });

  view.webContents.on('did-navigate-in-page', (event, navUrl) => {
    if (mainWindow) {
      mainWindow.webContents.send('browser-navigated', { profileId, url: navUrl, title: view.webContents.getTitle() });
    }
  });

  view.webContents.on('page-title-updated', (event, title) => {
    if (mainWindow) {
      mainWindow.webContents.send('browser-title-updated', { profileId, title });
    }
  });

  view.webContents.on('did-start-loading', () => {
    if (mainWindow) {
      mainWindow.webContents.send('browser-loading', { profileId, isLoading: true });
    }
  });

  view.webContents.on('did-stop-loading', () => {
    if (mainWindow) {
      mainWindow.webContents.send('browser-loading', { profileId, isLoading: false });
    }
  });

  // Allow new windows to open
  view.webContents.setWindowOpenHandler(({ url }) => {
    view.webContents.loadURL(url);
    return { action: 'deny' };
  });

  // Load URL
  if (url) {
    view.webContents.loadURL(url);
  }

  return { profileId, url };
}

function showBrowserView(profileId, bounds) {
  if (!mainWindow) return;

  // Hide current view
  if (activeBrowserViewId && browserViews.has(activeBrowserViewId)) {
    mainWindow.removeBrowserView(browserViews.get(activeBrowserViewId));
  }

  const view = browserViews.get(profileId);
  if (!view) return;

  mainWindow.addBrowserView(view);
  if (bounds) {
    view.setBounds({ x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height });
    view.setAutoResize({ width: true, height: true });
  }
  activeBrowserViewId = profileId;
}

function hideBrowserView() {
  if (!mainWindow || !activeBrowserViewId) return;
  if (browserViews.has(activeBrowserViewId)) {
    mainWindow.removeBrowserView(browserViews.get(activeBrowserViewId));
  }
  activeBrowserViewId = null;
}

function destroyBrowserView(profileId) {
  const view = browserViews.get(profileId);
  if (view) {
    if (mainWindow && activeBrowserViewId === profileId) {
      mainWindow.removeBrowserView(view);
      activeBrowserViewId = null;
    }
    view.webContents.destroy();
    browserViews.delete(profileId);
  }
  browserProfiles.delete(profileId);
}

// ======================== IPC HANDLERS - BROWSER ========================

// Create a new browser profile
ipcMain.handle('browser-create-profile', (event, { profileId, name, partition }) => {
  createBrowserProfile(profileId, name, partition);
  return { success: true, profileId };
});

// Open URL in a profile's browser view
ipcMain.handle('browser-navigate', (event, { profileId, url }) => {
  let view = browserViews.get(profileId);
  if (!view) {
    createBrowserView(profileId, url);
  } else {
    view.webContents.loadURL(url);
  }
  return { success: true };
});

// Show a browser view (make it visible)
ipcMain.handle('browser-show', (event, { profileId, bounds }) => {
  if (!browserViews.has(profileId)) {
    createBrowserView(profileId, null);
  }
  showBrowserView(profileId, bounds);
  return { success: true };
});

// Hide the browser view
ipcMain.handle('browser-hide', () => {
  hideBrowserView();
  return { success: true };
});

// Update browser view bounds
ipcMain.handle('browser-set-bounds', (event, { profileId, bounds }) => {
  const view = browserViews.get(profileId);
  if (view && mainWindow) {
    view.setBounds({ x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height });
  }
  return { success: true };
});

// Go back
ipcMain.handle('browser-go-back', (event, { profileId }) => {
  const view = browserViews.get(profileId);
  if (view && view.webContents.canGoBack()) {
    view.webContents.goBack();
    return { success: true };
  }
  return { success: false };
});

// Go forward
ipcMain.handle('browser-go-forward', (event, { profileId }) => {
  const view = browserViews.get(profileId);
  if (view && view.webContents.canGoForward()) {
    view.webContents.goForward();
    return { success: true };
  }
  return { success: false };
});

// Reload
ipcMain.handle('browser-reload', (event, { profileId }) => {
  const view = browserViews.get(profileId);
  if (view) {
    view.webContents.reload();
    return { success: true };
  }
  return { success: false };
});

// Get current URL
ipcMain.handle('browser-get-url', (event, { profileId }) => {
  const view = browserViews.get(profileId);
  if (view) {
    return { url: view.webContents.getURL(), title: view.webContents.getTitle() };
  }
  return { url: '', title: '' };
});

// Can go back/forward
ipcMain.handle('browser-can-navigate', (event, { profileId }) => {
  const view = browserViews.get(profileId);
  if (view) {
    return { canGoBack: view.webContents.canGoBack(), canGoForward: view.webContents.canGoForward() };
  }
  return { canGoBack: false, canGoForward: false };
});

// Delete a browser profile
ipcMain.handle('browser-delete-profile', (event, { profileId }) => {
  destroyBrowserView(profileId);
  return { success: true };
});

// AI Browser Agent - Execute JavaScript on page
ipcMain.handle('browser-execute-js', async (event, { profileId, code }) => {
  const view = browserViews.get(profileId);
  if (view) {
    try {
      const result = await view.webContents.executeJavaScript(code);
      return { success: true, result: String(result) };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
  return { success: false, error: 'No browser view found' };
});

// AI Browser Agent - Get page content
ipcMain.handle('browser-get-page-content', async (event, { profileId }) => {
  const view = browserViews.get(profileId);
  if (view) {
    try {
      const result = await view.webContents.executeJavaScript(`
        JSON.stringify({
          title: document.title,
          url: window.location.href,
          text: document.body.innerText.substring(0, 5000),
          links: Array.from(document.querySelectorAll('a[href]')).slice(0, 50).map(a => ({ text: a.innerText.trim(), href: a.href })),
          forms: Array.from(document.querySelectorAll('form')).length,
          images: Array.from(document.querySelectorAll('img')).length,
          headings: Array.from(document.querySelectorAll('h1,h2,h3')).map(h => h.innerText.trim()).slice(0, 20),
        })
      `);
      return { success: true, content: JSON.parse(result) };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
  return { success: false, error: 'No browser view found' };
});

// AI Browser Agent - Fill form
ipcMain.handle('browser-fill-form', async (event, { profileId, selector, value }) => {
  const view = browserViews.get(profileId);
  if (view) {
    try {
      await view.webContents.executeJavaScript(`
        const el = document.querySelector('${selector}');
        if (el) {
          el.value = '${value}';
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      `);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
  return { success: false, error: 'No browser view found' };
});

// AI Browser Agent - Click element
ipcMain.handle('browser-click', async (event, { profileId, selector }) => {
  const view = browserViews.get(profileId);
  if (view) {
    try {
      await view.webContents.executeJavaScript(`
        const el = document.querySelector('${selector}');
        if (el) el.click();
      `);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
  return { success: false, error: 'No browser view found' };
});

// AI Browser Agent - Screenshot
ipcMain.handle('browser-screenshot', async (event, { profileId }) => {
  const view = browserViews.get(profileId);
  if (view) {
    try {
      const image = await view.webContents.capturePage();
      const dataUrl = image.toDataURL();
      return { success: true, dataUrl };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
  return { success: false, error: 'No browser view found' };
});

// Open new Chromium window for a profile
ipcMain.handle('browser-open-window', (event, { profileId, url }) => {
  const profile = browserProfiles.get(profileId);
  if (!profile) return { success: false };

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: `${profile.name} - WorkSpace Browser`,
    webPreferences: {
      partition: profile.partition,
      contextIsolation: true,
      sandbox: true,
    },
  });

  if (url) {
    win.loadURL(url);
  } else {
    win.loadURL('https://www.google.com');
  }

  return { success: true };
});

// ======================== EXISTING IPC HANDLERS ========================

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

// ======================== TRAY ========================

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
    { label: 'Dashboard', click: () => navigateTo('/') },
    { label: 'Projects', click: () => navigateTo('/projects') },
    { label: 'Chat', click: () => navigateTo('/chat') },
    { label: 'AI Agents', click: () => navigateTo('/ai-agents') },
    { label: 'Browser', click: () => navigateTo('/browser') },
    { type: 'separator' },
    {
      label: 'Quit WorkSpace',
      accelerator: 'CmdOrCtrl+Q',
      click: () => { isQuitting = true; app.quit(); },
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

// ======================== MENU ========================

function createMenu() {
  const template = [
    {
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { label: 'Preferences...', accelerator: 'CmdOrCtrl+,', click: () => navigateTo('/settings') },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { label: 'Quit WorkSpace', accelerator: 'CmdOrCtrl+Q', click: () => { isQuitting = true; app.quit(); } },
      ],
    },
    {
      label: 'File',
      submenu: [
        { label: 'New Task', accelerator: 'CmdOrCtrl+N', click: () => { if (mainWindow) mainWindow.webContents.send('new-task'); } },
        { label: 'New Browser Window', accelerator: 'CmdOrCtrl+Shift+B', click: () => navigateTo('/browser') },
        { type: 'separator' },
        { role: 'close' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' }, { role: 'redo' }, { type: 'separator' },
        { role: 'cut' }, { role: 'copy' }, { role: 'paste' },
        { role: 'pasteAndMatchStyle' }, { role: 'delete' }, { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Dashboard', accelerator: 'CmdOrCtrl+1', click: () => navigateTo('/') },
        { label: 'Projects', accelerator: 'CmdOrCtrl+2', click: () => navigateTo('/projects') },
        { label: 'Team', accelerator: 'CmdOrCtrl+3', click: () => navigateTo('/team') },
        { label: 'Chat', accelerator: 'CmdOrCtrl+4', click: () => navigateTo('/chat') },
        { label: 'AI Agents', accelerator: 'CmdOrCtrl+5', click: () => navigateTo('/ai-agents') },
        { label: 'Browser', accelerator: 'CmdOrCtrl+6', click: () => navigateTo('/browser') },
        { type: 'separator' },
        { role: 'reload' }, { role: 'forceReload' }, { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Navigate',
      submenu: [
        { label: 'Calendar', accelerator: 'CmdOrCtrl+7', click: () => navigateTo('/calendar') },
        { label: 'Time Tracking', accelerator: 'CmdOrCtrl+8', click: () => navigateTo('/time-tracking') },
        { label: 'Reports', accelerator: 'CmdOrCtrl+9', click: () => navigateTo('/reports') },
        { label: 'Documents', click: () => navigateTo('/documents') },
        { label: 'Attendance', click: () => navigateTo('/attendance') },
        { label: 'Goals & OKRs', click: () => navigateTo('/goals') },
        { type: 'separator' },
        { label: 'Settings', accelerator: 'CmdOrCtrl+,', click: () => navigateTo('/settings') },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' }, { role: 'zoom' },
        { type: 'separator' }, { role: 'front' },
        { type: 'separator' }, { role: 'window' },
      ],
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'About WorkSpace',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info', title: 'WorkSpace',
              message: 'WorkSpace - Company Management Platform',
              detail: `Version: ${app.getVersion()}\nElectron: ${process.versions.electron}\nChrome: ${process.versions.chrome}\nNode.js: ${process.versions.node}\n\nA complete workspace with real Chromium multi-profile browsers and AI agents.`,
            });
          },
        },
        {
          label: 'Keyboard Shortcuts', accelerator: 'CmdOrCtrl+/',
          click: () => { if (mainWindow) mainWindow.webContents.send('show-shortcuts'); },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// ======================== APP LIFECYCLE ========================

app.whenReady().then(() => {
  createWindow();
  createMenu();
  createTray();

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
  // Cleanup all browser views
  for (const [id, view] of browserViews) {
    try { view.webContents.destroy(); } catch (e) {}
  }
  browserViews.clear();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.setName('WorkSpace');

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (isDev) {
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});
