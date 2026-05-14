import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
