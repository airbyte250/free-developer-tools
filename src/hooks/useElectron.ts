import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface BrowserBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ElectronAPI {
  getAppVersion: () => Promise<string>;
  getPlatform: () => Promise<string>;
  showNotification: (title: string, body: string) => Promise<void>;
  setBadgeCount: (count: number) => Promise<void>;
  bounceDock: () => Promise<void>;
  setProgressBar: (progress: number) => Promise<void>;
  onNavigate: (callback: (route: string) => void) => void;
  onNewTask: (callback: () => void) => void;
  onNewProject: (callback: () => void) => void;
  onShowShortcuts: (callback: () => void) => void;
  isElectron: boolean;

  // Browser Profile APIs
  browserCreateProfile: (profileId: string, name: string, partition?: string) => Promise<{ success: boolean; profileId: string }>;
  browserDeleteProfile: (profileId: string) => Promise<{ success: boolean }>;
  browserNavigate: (profileId: string, url: string) => Promise<{ success: boolean }>;
  browserGoBack: (profileId: string) => Promise<{ success: boolean }>;
  browserGoForward: (profileId: string) => Promise<{ success: boolean }>;
  browserReload: (profileId: string) => Promise<{ success: boolean }>;
  browserGetUrl: (profileId: string) => Promise<{ url: string; title: string }>;
  browserCanNavigate: (profileId: string) => Promise<{ canGoBack: boolean; canGoForward: boolean }>;
  browserShow: (profileId: string, bounds: BrowserBounds) => Promise<{ success: boolean }>;
  browserHide: () => Promise<{ success: boolean }>;
  browserSetBounds: (profileId: string, bounds: BrowserBounds) => Promise<{ success: boolean }>;
  browserOpenWindow: (profileId: string, url?: string) => Promise<{ success: boolean }>;

  // AI Browser Agent APIs
  browserExecuteJs: (profileId: string, code: string) => Promise<{ success: boolean; result?: string; error?: string }>;
  browserGetPageContent: (profileId: string) => Promise<{ success: boolean; content?: { title: string; url: string; text: string; links: { text: string; href: string }[]; forms: number; images: number; headings: string[] }; error?: string }>;
  browserFillForm: (profileId: string, selector: string, value: string) => Promise<{ success: boolean; error?: string }>;
  browserClick: (profileId: string, selector: string) => Promise<{ success: boolean; error?: string }>;
  browserScreenshot: (profileId: string) => Promise<{ success: boolean; dataUrl?: string; error?: string }>;

  // Events
  onBrowserNavigated: (callback: (data: { profileId: string; url: string; title: string }) => void) => void;
  onBrowserTitleUpdated: (callback: (data: { profileId: string; title: string }) => void) => void;
  onBrowserLoading: (callback: (data: { profileId: string; isLoading: boolean }) => void) => void;
  onWindowResized: (callback: (data: { width: number; height: number }) => void) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export function useElectronNavigation() {
  const navigate = useNavigate();

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onNavigate((route: string) => {
        navigate(route);
      });
    }
  }, [navigate]);
}

export function useElectron() {
  const isElectron = Boolean(window.electronAPI?.isElectron);

  const showNotification = async (title: string, body: string) => {
    if (window.electronAPI) {
      await window.electronAPI.showNotification(title, body);
    }
  };

  const setBadgeCount = async (count: number) => {
    if (window.electronAPI) {
      await window.electronAPI.setBadgeCount(count);
    }
  };

  const bounceDock = async () => {
    if (window.electronAPI) {
      await window.electronAPI.bounceDock();
    }
  };

  const setProgressBar = async (progress: number) => {
    if (window.electronAPI) {
      await window.electronAPI.setProgressBar(progress);
    }
  };

  return {
    isElectron,
    showNotification,
    setBadgeCount,
    bounceDock,
    setProgressBar,
  };
}
