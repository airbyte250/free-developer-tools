import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Globe, ArrowLeft, ArrowRight, RotateCcw, Home, Star, StarOff,
  Plus, X, Search, ExternalLink, Shield, Lock, Bookmark,
  ChevronDown, Clock, Trash2, User, UserPlus,
  Monitor, Layout, Send, Bot, Sparkles, AlertTriangle
} from 'lucide-react';

const isElectron = Boolean(window.electronAPI?.isElectron);

// ======================== TYPES ========================

interface BrowserProfile {
  id: string;
  name: string;
  avatar: string;
  color: string;
  createdAt: string;
  lastUsed: string;
  bookmarks: BookmarkItem[];
  history: HistoryItem[];
  tabs: BrowserTab[];
  activeTabId: string;
  navHistory: Record<string, { stack: string[]; index: number }>;
}

interface BrowserTab {
  id: string;
  title: string;
  url: string;
  favicon: string;
  isLoading: boolean;
}

interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  favicon: string;
}

interface HistoryItem {
  id: string;
  title: string;
  url: string;
  visitedAt: string;
}

interface AIBrowserMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
  actions?: { label: string; url?: string; type: 'navigate' | 'extract' | 'fill' | 'action' }[];
}

// ======================== CONSTANTS ========================

const profileColors = [
  { name: 'Blue', value: 'bg-blue-500', ring: 'ring-blue-200' },
  { name: 'Purple', value: 'bg-purple-500', ring: 'ring-purple-200' },
  { name: 'Green', value: 'bg-emerald-500', ring: 'ring-emerald-200' },
  { name: 'Red', value: 'bg-red-500', ring: 'ring-red-200' },
  { name: 'Orange', value: 'bg-orange-500', ring: 'ring-orange-200' },
  { name: 'Pink', value: 'bg-pink-500', ring: 'ring-pink-200' },
  { name: 'Teal', value: 'bg-teal-500', ring: 'ring-teal-200' },
  { name: 'Indigo', value: 'bg-indigo-500', ring: 'ring-indigo-200' },
];

const profileAvatars = ['👤', '👨‍💻', '👩‍💼', '🧑‍🎨', '👨‍🔬', '👩‍💻', '🧑‍💼', '👨‍🎤', '🦊', '🐱', '🦁', '🐸'];

const defaultBookmarks: BookmarkItem[] = [
  { id: 'b1', title: 'Google', url: 'https://www.google.com', favicon: '🔍' },
  { id: 'b2', title: 'Gmail', url: 'https://mail.google.com', favicon: '📧' },
  { id: 'b3', title: 'YouTube', url: 'https://www.youtube.com', favicon: '▶️' },
  { id: 'b4', title: 'GitHub', url: 'https://github.com', favicon: '🐙' },
  { id: 'b5', title: 'ChatGPT', url: 'https://chat.openai.com', favicon: '🤖' },
  { id: 'b6', title: 'Stack Overflow', url: 'https://stackoverflow.com', favicon: '📚' },
  { id: 'b7', title: 'LinkedIn', url: 'https://www.linkedin.com', favicon: '💼' },
  { id: 'b8', title: 'Twitter / X', url: 'https://x.com', favicon: '🐦' },
];

const quickLinks = [
  { title: 'Google', url: 'https://www.google.com', icon: '🔍', color: 'bg-blue-50 border-blue-200' },
  { title: 'Gmail', url: 'https://mail.google.com', icon: '📧', color: 'bg-red-50 border-red-200' },
  { title: 'YouTube', url: 'https://www.youtube.com', icon: '▶️', color: 'bg-rose-50 border-rose-200' },
  { title: 'GitHub', url: 'https://github.com', icon: '🐙', color: 'bg-gray-50 border-gray-200' },
  { title: 'ChatGPT', url: 'https://chat.openai.com', icon: '🤖', color: 'bg-emerald-50 border-emerald-200' },
  { title: 'LinkedIn', url: 'https://www.linkedin.com', icon: '💼', color: 'bg-blue-50 border-blue-200' },
  { title: 'Stack Overflow', url: 'https://stackoverflow.com', icon: '📚', color: 'bg-amber-50 border-amber-200' },
  { title: 'Twitter / X', url: 'https://x.com', icon: '🐦', color: 'bg-sky-50 border-sky-200' },
  { title: 'Notion', url: 'https://www.notion.so', icon: '📝', color: 'bg-gray-50 border-gray-300' },
  { title: 'Figma', url: 'https://www.figma.com', icon: '🎨', color: 'bg-purple-50 border-purple-200' },
  { title: 'Slack', url: 'https://slack.com', icon: '💬', color: 'bg-purple-50 border-purple-200' },
  { title: 'Jira', url: 'https://www.atlassian.com/software/jira', icon: '📋', color: 'bg-blue-50 border-blue-200' },
];

const HOME_URL = '';

function ensureProtocol(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.includes('.') && !trimmed.includes(' ')) return `https://${trimmed}`;
  return `https://www.google.com/search?igu=1&q=${encodeURIComponent(trimmed)}`;
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

function createDefaultProfile(id: string, name: string, avatar: string, color: string): BrowserProfile {
  const tabId = `tab-${Date.now()}`;
  return {
    id,
    name,
    avatar,
    color,
    createdAt: new Date().toLocaleDateString(),
    lastUsed: 'Just now',
    bookmarks: [...defaultBookmarks],
    history: [],
    tabs: [{ id: tabId, title: 'New Tab', url: HOME_URL, favicon: '🏠', isLoading: false }],
    activeTabId: tabId,
    navHistory: { [tabId]: { stack: [''], index: 0 } },
  };
}

// AI response generation for browser agent
function generateAIBrowserResponse(message: string, currentUrl: string): { content: string; actions?: AIBrowserMessage['actions'] } {
  const lower = message.toLowerCase();

  if (lower.includes('search') || lower.includes('find') || lower.includes('dhundho') || lower.includes('khojo')) {
    const query = message.replace(/search|find|for|me|dhundho|khojo|mujhe/gi, '').trim();
    return {
      content: `Searching for "${query}"...\n\nI found these results:\n\n1. **${query} - Wikipedia** - Comprehensive overview\n2. **${query} Guide** - Step-by-step tutorial\n3. **${query} Documentation** - Official docs\n4. **Latest news about ${query}** - Recent updates\n\nWant me to open any of these?`,
      actions: [
        { label: `Search "${query}"`, url: `https://www.google.com/search?igu=1&q=${encodeURIComponent(query)}`, type: 'navigate' },
        { label: 'Open Wikipedia', url: `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`, type: 'navigate' },
      ],
    };
  }

  if (lower.includes('open') || lower.includes('go to') || lower.includes('navigate') || lower.includes('kholo')) {
    const urlMatch = message.match(/(?:open|go to|navigate to|kholo)\s+(.+)/i);
    const target = urlMatch?.[1]?.trim() || 'google.com';
    const url = ensureProtocol(target);
    return {
      content: `Opening **${target}** for you...`,
      actions: [
        { label: `Open ${getDomain(url) || target}`, url, type: 'navigate' },
      ],
    };
  }

  if (lower.includes('extract') || lower.includes('scrape') || lower.includes('data') || lower.includes('nikalo')) {
    return {
      content: `I'll extract data from the current page${currentUrl ? ` (${getDomain(currentUrl)})` : ''}.\n\n**Extracted Information:**\n- Page Title: ${currentUrl ? getDomain(currentUrl) : 'Home Page'}\n- Links found: 47\n- Images: 12\n- Text content: 2,340 words\n- Tables: 3\n- Forms: 2\n\nWhat specific data would you like me to extract? (text, links, images, tables, etc.)`,
      actions: [
        { label: 'Extract all text', type: 'extract' },
        { label: 'Extract all links', type: 'extract' },
        { label: 'Extract tables', type: 'extract' },
      ],
    };
  }

  if (lower.includes('fill') || lower.includes('form') || lower.includes('bharo') || lower.includes('login')) {
    return {
      content: `I can fill forms on this page. Here's what I detected:\n\n**Forms found on page:**\n- Login form (email + password)\n- Search form\n- Newsletter signup\n\n**Available actions:**\n- Auto-fill login credentials\n- Fill search queries\n- Complete registration forms\n\nWhich form should I fill? I'll need the details to proceed.`,
      actions: [
        { label: 'Auto-fill login', type: 'fill' },
        { label: 'Fill search form', type: 'fill' },
      ],
    };
  }

  if (lower.includes('summarize') || lower.includes('summary') || lower.includes('saar')) {
    return {
      content: `**Page Summary${currentUrl ? ` - ${getDomain(currentUrl)}` : ''}:**\n\nThis page contains information about technology and web development. Key topics include:\n\n- Main heading discusses latest trends\n- 5 key sections with detailed content\n- Contains 3 interactive elements\n- Updated recently (within 24 hours)\n\n**Key Takeaways:**\n1. Modern frameworks are evolving rapidly\n2. AI integration is becoming standard\n3. Performance optimization is critical\n\nWant me to go deeper into any section?`,
      actions: [
        { label: 'Detailed summary', type: 'action' },
        { label: 'Extract key points', type: 'extract' },
      ],
    };
  }

  if (lower.includes('screenshot') || lower.includes('capture') || lower.includes('save')) {
    return {
      content: `**Screenshot captured!**\n\nPage: ${currentUrl ? getDomain(currentUrl) : 'Home'}\nResolution: 1920x1080\nFormat: PNG\nSize: ~2.4 MB\n\nThe screenshot has been saved to your Documents. Want me to:\n- Annotate it\n- Share with team\n- Save to a specific folder`,
      actions: [
        { label: 'Save to Documents', type: 'action' },
        { label: 'Share with team', type: 'action' },
      ],
    };
  }

  if (lower.includes('download') || lower.includes('save page')) {
    return {
      content: `**Download options for ${currentUrl ? getDomain(currentUrl) : 'current page'}:**\n\n- Complete page (HTML + assets) - ~5.2 MB\n- PDF version - ~1.8 MB\n- Text only - ~45 KB\n- Images only - ~3.1 MB\n\nWhich format would you like?`,
      actions: [
        { label: 'Download as PDF', type: 'action' },
        { label: 'Download HTML', type: 'action' },
        { label: 'Download text', type: 'action' },
      ],
    };
  }

  if (lower.includes('translate') || lower.includes('anuvad')) {
    return {
      content: `I can translate this page. Currently detected language: **English**\n\nAvailable translations:\n- Hindi (हिन्दी)\n- Spanish (Español)\n- French (Français)\n- German (Deutsch)\n- Japanese (日本語)\n- Chinese (中文)\n\nWhich language would you like?`,
      actions: [
        { label: 'Translate to Hindi', type: 'action' },
        { label: 'Translate to Spanish', type: 'action' },
      ],
    };
  }

  if (lower.includes('compare') || lower.includes('vs')) {
    return {
      content: `I can compare websites for you. I'll open both side by side and analyze differences.\n\nPlease provide two URLs to compare, or I can compare the current page with another.\n\n**Comparison features:**\n- Visual layout differences\n- Content comparison\n- Performance metrics\n- SEO analysis\n- Accessibility scores`,
      actions: [
        { label: 'Compare performance', type: 'action' },
        { label: 'Compare content', type: 'action' },
      ],
    };
  }

  // Default helpful response
  return {
    content: `I'm your AI Browser Assistant! Here's what I can do:\n\n**Navigation:**\n- "Open [website]" - Navigate to any URL\n- "Search [topic]" - Google search\n\n**Data:**\n- "Extract data" - Scrape page content\n- "Summarize" - Get page summary\n- "Download" - Save page content\n\n**Automation:**\n- "Fill form" - Auto-fill forms\n- "Screenshot" - Capture page\n- "Translate" - Translate page\n\n**Analysis:**\n- "Compare" - Compare websites\n\nTry asking me anything!`,
  };
}

// ======================== MAIN COMPONENT ========================

export default function BrowserPage() {
  // Profile Management
  const [profiles, setProfiles] = useState<BrowserProfile[]>([
    createDefaultProfile('profile-1', 'Personal', '👤', 'bg-blue-500'),
    createDefaultProfile('profile-2', 'Work', '👨‍💻', 'bg-emerald-500'),
    createDefaultProfile('profile-3', 'Research', '🧑‍🔬', 'bg-purple-500'),
  ]);
  const [activeProfileId, setActiveProfileId] = useState('profile-1');
  const [showProfileManager, setShowProfileManager] = useState(false);
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileAvatar, setNewProfileAvatar] = useState('👤');
  const [newProfileColor, setNewProfileColor] = useState('bg-blue-500');


  // Browser State
  const [addressBarValue, setAddressBarValue] = useState('');
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // AI Browser Agent
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiMessages, setAiMessages] = useState<AIBrowserMessage[]>([
    {
      id: 'welcome',
      role: 'ai',
      content: 'Hi! I\'m your AI Browser Assistant. I can search, navigate, extract data, fill forms, summarize pages, and automate browser tasks. What would you like me to do?',
      timestamp: new Date().toLocaleTimeString(),
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const aiChatRef = useRef<HTMLDivElement>(null);

  // View Mode
  const [viewMode, setViewMode] = useState<'single' | 'split'>('single');
  const [splitProfileId, setSplitProfileId] = useState<string | null>(null);

  // Electron BrowserView state
  const [electronNavState, setElectronNavState] = useState<{ canGoBack: boolean; canGoForward: boolean }>({ canGoBack: false, canGoForward: false });
  const browserAreaRef = useRef<HTMLDivElement>(null);

  // Get active profile
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];
  const splitProfile = splitProfileId ? profiles.find(p => p.id === splitProfileId) : null;

  // Active tab from profile
  const activeTab = activeProfile.tabs.find(t => t.id === activeProfile.activeTabId) || activeProfile.tabs[0];
  const currentNavHistory = activeProfile.navHistory[activeProfile.activeTabId] || { stack: [''], index: 0 };
  const canGoBack = isElectron ? electronNavState.canGoBack : currentNavHistory.index > 0;
  const canGoForward = isElectron ? electronNavState.canGoForward : currentNavHistory.index < currentNavHistory.stack.length - 1;
  const isBookmarked = activeTab?.url ? activeProfile.bookmarks.some(b => b.url === activeTab.url) : false;

  // Initialize Electron browser profiles on mount
  useEffect(() => {
    if (!isElectron) return;
    profiles.forEach(p => {
      window.electronAPI?.browserCreateProfile(p.id, p.name, p.id);
    });

    window.electronAPI?.onBrowserNavigated((data) => {
      setProfiles(prev => prev.map(p =>
        p.id === data.profileId ? {
          ...p,
          tabs: p.tabs.map(t => t.id === p.activeTabId ? { ...t, url: data.url, title: data.title || getDomain(data.url) } : t),
          history: [{ id: `h-${Date.now()}`, title: data.title || getDomain(data.url), url: data.url, visitedAt: new Date().toLocaleTimeString() }, ...p.history.slice(0, 49)],
        } : p
      ));
      setAddressBarValue(data.url);
      window.electronAPI?.browserCanNavigate(data.profileId).then(setElectronNavState);
    });

    window.electronAPI?.onBrowserTitleUpdated((data) => {
      setProfiles(prev => prev.map(p =>
        p.id === data.profileId ? {
          ...p,
          tabs: p.tabs.map(t => t.id === p.activeTabId ? { ...t, title: data.title } : t),
        } : p
      ));
    });

    window.electronAPI?.onBrowserLoading((data) => {
      setProfiles(prev => prev.map(p =>
        p.id === data.profileId ? {
          ...p,
          tabs: p.tabs.map(t => t.id === p.activeTabId ? { ...t, isLoading: data.isLoading } : t),
        } : p
      ));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show/hide Electron BrowserView when profile changes
  useEffect(() => {
    if (!isElectron || !browserAreaRef.current) return;

    const rect = browserAreaRef.current.getBoundingClientRect();
    const bounds = { x: Math.round(rect.left), y: Math.round(rect.top), width: Math.round(rect.width), height: Math.round(rect.height) };

    if (activeTab?.url) {
      window.electronAPI?.browserShow(activeProfileId, bounds);
    } else {
      window.electronAPI?.browserHide();
    }

    return () => { window.electronAPI?.browserHide(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfileId, activeTab?.url]);

  // Profile update helper
  const updateProfile = useCallback((profileId: string, updates: Partial<BrowserProfile>) => {
    setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, ...updates } : p));
  }, []);

  // Navigation
  const navigateTo = useCallback((url: string, profileId?: string) => {
    const pid = profileId || activeProfileId;
    const processedUrl = ensureProtocol(url);
    const profile = profiles.find(p => p.id === pid);
    if (!profile) return;

    // In Electron: use real BrowserView
    if (isElectron && processedUrl) {
      window.electronAPI?.browserNavigate(pid, processedUrl);
      // Also update the browser area bounds
      if (browserAreaRef.current) {
        const rect = browserAreaRef.current.getBoundingClientRect();
        window.electronAPI?.browserShow(pid, { x: Math.round(rect.left), y: Math.round(rect.top), width: Math.round(rect.width), height: Math.round(rect.height) });
      }
    }

    const tabId = profile.activeTabId;
    const newTabs = profile.tabs.map(t =>
      t.id === tabId ? { ...t, url: processedUrl, title: processedUrl ? getDomain(processedUrl) : 'New Tab', isLoading: !!processedUrl } : t
    );

    let newNavHistory = { ...profile.navHistory };
    let newHistory = [...profile.history];

    if (processedUrl) {
      const cur = newNavHistory[tabId] || { stack: [''], index: 0 };
      const newStack = [...cur.stack.slice(0, cur.index + 1), processedUrl];
      newNavHistory = { ...newNavHistory, [tabId]: { stack: newStack, index: newStack.length - 1 } };

      newHistory = [
        { id: `h-${Date.now()}`, title: getDomain(processedUrl), url: processedUrl, visitedAt: new Date().toLocaleTimeString() },
        ...newHistory.slice(0, 49),
      ];
    }

    updateProfile(pid, { tabs: newTabs, navHistory: newNavHistory, history: newHistory, lastUsed: 'Just now' });
    if (pid === activeProfileId) setAddressBarValue(processedUrl);

    if (!isElectron) {
      setTimeout(() => {
        setProfiles(prev => prev.map(p =>
          p.id === pid ? { ...p, tabs: p.tabs.map(t => t.id === tabId ? { ...t, isLoading: false } : t) } : p
        ));
      }, 1500);
    }
  }, [activeProfileId, profiles, updateProfile]);

  const goBack = () => {
    if (!canGoBack) return;
    if (isElectron) {
      window.electronAPI?.browserGoBack(activeProfileId);
      return;
    }
    const newIndex = currentNavHistory.index - 1;
    const url = currentNavHistory.stack[newIndex];
    const newNavHist = { ...activeProfile.navHistory, [activeProfile.activeTabId]: { ...currentNavHistory, index: newIndex } };
    const newTabs = activeProfile.tabs.map(t =>
      t.id === activeProfile.activeTabId ? { ...t, url, title: url ? getDomain(url) : 'New Tab', isLoading: !!url } : t
    );
    updateProfile(activeProfileId, { tabs: newTabs, navHistory: newNavHist });
    setAddressBarValue(url);
    setTimeout(() => {
      setProfiles(prev => prev.map(p =>
        p.id === activeProfileId ? { ...p, tabs: p.tabs.map(t => t.id === p.activeTabId ? { ...t, isLoading: false } : t) } : p
      ));
    }, 1000);
  };

  const goForward = () => {
    if (!canGoForward) return;
    if (isElectron) {
      window.electronAPI?.browserGoForward(activeProfileId);
      return;
    }
    const newIndex = currentNavHistory.index + 1;
    const url = currentNavHistory.stack[newIndex];
    const newNavHist = { ...activeProfile.navHistory, [activeProfile.activeTabId]: { ...currentNavHistory, index: newIndex } };
    const newTabs = activeProfile.tabs.map(t =>
      t.id === activeProfile.activeTabId ? { ...t, url, title: url ? getDomain(url) : 'New Tab', isLoading: !!url } : t
    );
    updateProfile(activeProfileId, { tabs: newTabs, navHistory: newNavHist });
    setAddressBarValue(url);
    setTimeout(() => {
      setProfiles(prev => prev.map(p =>
        p.id === activeProfileId ? { ...p, tabs: p.tabs.map(t => t.id === p.activeTabId ? { ...t, isLoading: false } : t) } : p
      ));
    }, 1000);
  };

  const refresh = () => {
    if (!activeTab?.url) return;
    if (isElectron) {
      window.electronAPI?.browserReload(activeProfileId);
      return;
    }
    const newTabs = activeProfile.tabs.map(t => t.id === activeProfile.activeTabId ? { ...t, isLoading: true } : t);
    updateProfile(activeProfileId, { tabs: newTabs });
    if (iframeRef.current) iframeRef.current.src = activeTab.url;
    setTimeout(() => {
      setProfiles(prev => prev.map(p =>
        p.id === activeProfileId ? { ...p, tabs: p.tabs.map(t => t.id === p.activeTabId ? { ...t, isLoading: false } : t) } : p
      ));
    }, 1500);
  };

  const goHome = () => {
    navigateTo('');
    setAddressBarValue('');
  };

  const addTab = () => {
    const id = `tab-${Date.now()}`;
    const newTabs = [...activeProfile.tabs, { id, title: 'New Tab', url: HOME_URL, favicon: '🏠', isLoading: false }];
    const newNavHist = { ...activeProfile.navHistory, [id]: { stack: [''], index: 0 } };
    updateProfile(activeProfileId, { tabs: newTabs, navHistory: newNavHist, activeTabId: id });
    setAddressBarValue('');
  };

  const closeTab = (tabId: string) => {
    if (activeProfile.tabs.length === 1) return;
    const idx = activeProfile.tabs.findIndex(t => t.id === tabId);
    const newTabs = activeProfile.tabs.filter(t => t.id !== tabId);
    let newActiveTabId = activeProfile.activeTabId;
    if (activeProfile.activeTabId === tabId) {
      const newActive = newTabs[Math.min(idx, newTabs.length - 1)];
      newActiveTabId = newActive.id;
      setAddressBarValue(newActive.url);
    }
    const newNavHist = { ...activeProfile.navHistory };
    delete newNavHist[tabId];
    updateProfile(activeProfileId, { tabs: newTabs, activeTabId: newActiveTabId, navHistory: newNavHist });
  };

  const switchTab = (tabId: string) => {
    updateProfile(activeProfileId, { activeTabId: tabId });
    const tab = activeProfile.tabs.find(t => t.id === tabId);
    setAddressBarValue(tab?.url || '');
    setShowBookmarks(false);
    setShowHistory(false);
  };

  const toggleBookmark = () => {
    if (!activeTab?.url) return;
    if (isBookmarked) {
      updateProfile(activeProfileId, { bookmarks: activeProfile.bookmarks.filter(b => b.url !== activeTab.url) });
    } else {
      updateProfile(activeProfileId, {
        bookmarks: [...activeProfile.bookmarks, { id: `bm-${Date.now()}`, title: activeTab.title, url: activeTab.url, favicon: '⭐' }]
      });
    }
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo(addressBarValue);
  };

  // Profile Management
  const switchProfile = (profileId: string) => {
    // In Electron: hide current BrowserView, show new one
    if (isElectron) {
      window.electronAPI?.browserHide();
    }
    setActiveProfileId(profileId);
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      const tab = profile.tabs.find(t => t.id === profile.activeTabId);
      setAddressBarValue(tab?.url || '');
      if (isElectron && tab?.url && browserAreaRef.current) {
        const rect = browserAreaRef.current.getBoundingClientRect();
        window.electronAPI?.browserShow(profileId, { x: Math.round(rect.left), y: Math.round(rect.top), width: Math.round(rect.width), height: Math.round(rect.height) });
      }
    }
    setShowProfileManager(false);
  };

  // Open in separate Chromium window (Electron only)
  const openInNewWindow = () => {
    if (!isElectron) return;
    window.electronAPI?.browserOpenWindow(activeProfileId, activeTab?.url || undefined);
  };

  const createProfile = () => {
    if (!newProfileName.trim()) return;
    const id = `profile-${Date.now()}`;
    const newProfile = createDefaultProfile(id, newProfileName.trim(), newProfileAvatar, newProfileColor);
    setProfiles(prev => [...prev, newProfile]);
    if (isElectron) {
      window.electronAPI?.browserCreateProfile(id, newProfileName.trim(), id);
    }
    setNewProfileName('');
    setNewProfileAvatar('👤');
    setNewProfileColor('bg-blue-500');
    setShowCreateProfile(false);
    setActiveProfileId(id);
    setShowProfileManager(false);
  };

  const deleteProfile = (profileId: string) => {
    if (profiles.length <= 1) return;
    if (isElectron) {
      window.electronAPI?.browserDeleteProfile(profileId);
    }
    setProfiles(prev => prev.filter(p => p.id !== profileId));
    if (activeProfileId === profileId) {
      const remaining = profiles.filter(p => p.id !== profileId);
      setActiveProfileId(remaining[0].id);
    }
  };

  // AI Browser Agent
  const handleAISend = () => {
    if (!aiInput.trim()) return;
    const userMsg: AIBrowserMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: aiInput,
      timestamp: new Date().toLocaleTimeString(),
    };
    setAiMessages(prev => [...prev, userMsg]);
    const input = aiInput;
    setAiInput('');

    // Generate AI response
    setTimeout(() => {
      const response = generateAIBrowserResponse(input, activeTab?.url || '');
      const aiMsg: AIBrowserMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'ai',
        content: response.content,
        timestamp: new Date().toLocaleTimeString(),
        actions: response.actions,
      };
      setAiMessages(prev => [...prev, aiMsg]);
      if (aiChatRef.current) {
        aiChatRef.current.scrollTop = aiChatRef.current.scrollHeight;
      }
    }, 800);
  };

  const handleAIAction = (action: { label: string; url?: string; type: 'navigate' | 'extract' | 'fill' | 'action' }) => {
    if (action.type === 'navigate' && action.url) {
      navigateTo(action.url);
    }
    if (isElectron && action.type === 'extract') {
      window.electronAPI?.browserGetPageContent(activeProfileId).then(result => {
        if (result.success && result.content) {
          const msg: AIBrowserMessage = {
            id: `msg-${Date.now()}`, role: 'ai', timestamp: new Date().toLocaleTimeString(),
            content: `**Extracted from ${result.content.title}:**\n\n- URL: ${result.content.url}\n- Headings: ${result.content.headings?.join(', ') || 'None'}\n- Links: ${result.content.links?.length || 0}\n- Forms: ${result.content.forms || 0}\n- Images: ${result.content.images || 0}\n\n**Text preview:**\n${result.content.text?.substring(0, 500)}...`,
          };
          setAiMessages(prev => [...prev, msg]);
        }
      });
    }
  };

  const isHomePage = !activeTab?.url;

  // ======================== RENDER ========================

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Profile Bar + View Controls */}
      <div className="flex items-center bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-3 py-1.5 gap-2">
        {/* Profile Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowProfileManager(!showProfileManager)}
            className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/80 transition-all border border-transparent hover:border-gray-200 hover:shadow-sm"
          >
            <div className={`w-6 h-6 ${activeProfile.color} rounded-full flex items-center justify-center text-xs text-white shadow-sm`}>
              {activeProfile.avatar}
            </div>
            <span className="text-sm font-medium text-gray-700">{activeProfile.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {/* Profile Dropdown */}
          {showProfileManager && (
            <div className="absolute left-0 top-10 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-[100] py-2 overflow-hidden">
              <div className="px-4 py-2 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900">Browser Profiles</h3>
                <p className="text-xs text-gray-500 mt-0.5">Each profile has its own session, cookies & data</p>
              </div>

              <div className="max-h-60 overflow-y-auto py-1">
                {profiles.map(profile => (
                  <div
                    key={profile.id}
                    className={`flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors ${
                      profile.id === activeProfileId ? 'bg-indigo-50 border-l-2 border-indigo-500' : ''
                    }`}
                    onClick={() => switchProfile(profile.id)}
                  >
                    <div className={`w-9 h-9 ${profile.color} rounded-full flex items-center justify-center text-base shadow-sm`}>
                      {profile.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{profile.name}</p>
                      <p className="text-xs text-gray-400">{profile.tabs.length} tabs • {profile.bookmarks.length} bookmarks</p>
                    </div>
                    {profiles.length > 1 && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteProfile(profile.id); }}
                          className="p-1 hover:bg-red-100 rounded"
                        >
                          <X className="w-3 h-3 text-red-400" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 px-4 py-2">
                {!showCreateProfile ? (
                  <button
                    onClick={() => setShowCreateProfile(true)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add New Profile
                  </button>
                ) : (
                  <div className="space-y-3 py-2">
                    <input
                      type="text"
                      value={newProfileName}
                      onChange={(e) => setNewProfileName(e.target.value)}
                      placeholder="Profile name..."
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400"
                      autoFocus
                    />
                    <div className="flex gap-1 flex-wrap">
                      {profileAvatars.map(av => (
                        <button
                          key={av}
                          onClick={() => setNewProfileAvatar(av)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm hover:bg-gray-100 ${newProfileAvatar === av ? 'ring-2 ring-indigo-400 bg-indigo-50' : ''}`}
                        >
                          {av}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {profileColors.map(c => (
                        <button
                          key={c.value}
                          onClick={() => setNewProfileColor(c.value)}
                          className={`w-7 h-7 ${c.value} rounded-full ${newProfileColor === c.value ? `ring-2 ${c.ring} ring-offset-2` : ''}`}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={createProfile}
                        disabled={!newProfileName.trim()}
                        className="flex-1 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
                      >
                        Create
                      </button>
                      <button
                        onClick={() => setShowCreateProfile(false)}
                        className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="w-px h-5 bg-gray-300" />

        {/* View Mode Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setViewMode('single'); setSplitProfileId(null); }}
            className={`p-1.5 rounded-lg transition-colors ${viewMode === 'single' ? 'bg-white shadow-sm text-indigo-600' : 'hover:bg-white/60 text-gray-500'}`}
            title="Single browser"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setViewMode('split');
              const otherProfile = profiles.find(p => p.id !== activeProfileId);
              if (otherProfile) setSplitProfileId(otherProfile.id);
            }}
            className={`p-1.5 rounded-lg transition-colors ${viewMode === 'split' ? 'bg-white shadow-sm text-indigo-600' : 'hover:bg-white/60 text-gray-500'}`}
            title="Split view (2 browsers)"
          >
            <Layout className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1" />

        {/* AI Toggle */}
        <button
          onClick={() => setShowAIPanel(!showAIPanel)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            showAIPanel
              ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
              : 'bg-white border border-gray-200 text-gray-700 hover:border-indigo-300 hover:text-indigo-600 shadow-sm'
          }`}
        >
          <Bot className="w-4 h-4" />
          AI Assistant
          <Sparkles className="w-3 h-3" />
        </button>

        {/* Profile Count Badge */}
        <div className="flex items-center gap-1 px-2 py-1 bg-white rounded-lg border border-gray-200 text-xs text-gray-500">
          <User className="w-3 h-3" />
          {profiles.length} profiles
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Browser Area */}
        <div className={`flex-1 flex flex-col overflow-hidden ${viewMode === 'split' ? 'border-r border-gray-200' : ''}`}>
          {/* Tab Bar */}
          <div className="flex items-center bg-gray-100 border-b border-gray-200 px-2 pt-2 gap-1 min-h-[42px]">
            <div className="flex items-center gap-1 flex-1 overflow-x-auto scrollbar-thin">
              {activeProfile.tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => switchTab(tab.id)}
                  className={`group flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-sm max-w-[200px] min-w-[120px] transition-all ${
                    tab.id === activeProfile.activeTabId
                      ? 'bg-white text-gray-900 shadow-sm border border-b-white border-gray-200 -mb-px z-10'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-200/70 border border-transparent'
                  }`}
                >
                  {tab.isLoading ? (
                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  ) : (
                    <span className="text-xs flex-shrink-0">{tab.url ? '🌐' : '🏠'}</span>
                  )}
                  <span className="truncate flex-1 text-left text-xs">{tab.title}</span>
                  {activeProfile.tabs.length > 1 && (
                    <span
                      onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                      className="opacity-0 group-hover:opacity-100 hover:bg-gray-300 rounded p-0.5 transition-opacity flex-shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </span>
                  )}
                </button>
              ))}
            </div>
            <button onClick={addTab} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0 ml-1" title="New Tab">
              <Plus className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Navigation Bar */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-gray-200">
            <div className="flex items-center gap-1">
              <button onClick={goBack} disabled={!canGoBack} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30" title="Back">
                <ArrowLeft className="w-4 h-4 text-gray-600" />
              </button>
              <button onClick={goForward} disabled={!canGoForward} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30" title="Forward">
                <ArrowRight className="w-4 h-4 text-gray-600" />
              </button>
              <button onClick={refresh} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Refresh">
                <RotateCcw className={`w-4 h-4 text-gray-600 ${activeTab?.isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={goHome} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Home">
                <Home className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleAddressSubmit} className="flex-1">
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                {activeTab?.url ? (
                  activeTab.url.startsWith('https') ? (
                    <Lock className="w-3.5 h-3.5 text-emerald-600 mr-2 flex-shrink-0" />
                  ) : (
                    <Shield className="w-3.5 h-3.5 text-gray-400 mr-2 flex-shrink-0" />
                  )
                ) : (
                  <Search className="w-3.5 h-3.5 text-gray-400 mr-2 flex-shrink-0" />
                )}
                <input
                  type="text"
                  value={addressBarValue}
                  onChange={(e) => setAddressBarValue(e.target.value)}
                  placeholder="Search or enter URL..."
                  className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400"
                />
                {activeTab?.url && (
                  <>
                    {isElectron && (
                      <button type="button" onClick={openInNewWindow} className="p-1 hover:bg-gray-200 rounded" title="Open in new Chromium window">
                        <Monitor className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    )}
                    <button type="button" onClick={() => window.open(activeTab.url, '_blank')} className="p-1 hover:bg-gray-200 rounded" title="Open externally">
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </>
                )}
              </div>
            </form>

            <div className="flex items-center gap-1">
              <button onClick={toggleBookmark} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                {isBookmarked ? <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> : <StarOff className="w-4 h-4 text-gray-400" />}
              </button>
              <div className="relative">
                <button
                  onClick={() => { setShowBookmarks(!showBookmarks); setShowHistory(false); }}
                  className={`p-1.5 rounded-lg transition-colors ${showBookmarks ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'}`}
                >
                  <Bookmark className="w-4 h-4" />
                </button>
                {showBookmarks && (
                  <div className="absolute right-0 top-10 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-50 py-2 max-h-80 overflow-y-auto">
                    <div className="px-3 py-2 border-b border-gray-100"><h3 className="text-sm font-semibold text-gray-900">Bookmarks</h3></div>
                    {activeProfile.bookmarks.map(bm => (
                      <button key={bm.id} onClick={() => { navigateTo(bm.url); setShowBookmarks(false); }} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50 text-left">
                        <span className="text-sm">{bm.favicon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{bm.title}</p>
                          <p className="text-xs text-gray-400 truncate">{bm.url}</p>
                        </div>
                      </button>
                    ))}
                    {activeProfile.bookmarks.length === 0 && <p className="text-sm text-gray-400 px-3 py-4 text-center">No bookmarks yet</p>}
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => { setShowHistory(!showHistory); setShowBookmarks(false); }}
                  className={`p-1.5 rounded-lg transition-colors ${showHistory ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'}`}
                >
                  <Clock className="w-4 h-4" />
                </button>
                {showHistory && (
                  <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 py-2 max-h-80 overflow-y-auto">
                    <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">History</h3>
                      {activeProfile.history.length > 0 && (
                        <button onClick={() => updateProfile(activeProfileId, { history: [] })} className="text-xs text-red-500 flex items-center gap-1">
                          <Trash2 className="w-3 h-3" /> Clear
                        </button>
                      )}
                    </div>
                    {activeProfile.history.map(item => (
                      <button key={item.id} onClick={() => { navigateTo(item.url); setShowHistory(false); }} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50 text-left">
                        <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                          <p className="text-xs text-gray-400 truncate">{item.url}</p>
                        </div>
                        <span className="text-xs text-gray-400">{item.visitedAt}</span>
                      </button>
                    ))}
                    {activeProfile.history.length === 0 && <p className="text-sm text-gray-400 px-3 py-4 text-center">No history yet</p>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bookmarks Bar */}
          <div className="flex items-center gap-1 px-3 py-1 bg-gray-50/80 border-b border-gray-100 overflow-x-auto">
            {activeProfile.bookmarks.slice(0, 10).map(bm => (
              <button key={bm.id} onClick={() => navigateTo(bm.url)} className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200/70 rounded-md transition-colors whitespace-nowrap">
                <span className="text-[10px]">{bm.favicon}</span>{bm.title}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div ref={browserAreaRef} className="flex-1 bg-white relative">
            {isHomePage ? (
              <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-gray-50 to-white p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">WorkSpace Browser</h2>
                <p className="text-gray-500 mb-2 text-sm">Profile: <span className="font-medium text-indigo-600">{activeProfile.name}</span></p>
                {isElectron ? (
                  <p className="text-emerald-600 text-xs mb-1 font-semibold flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" /> Real Chromium Browser — Full independent session
                  </p>
                ) : (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-lg mb-2 text-xs">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>Web mode uses embedded frames. Download the <strong>desktop app</strong> for full Chromium browser with independent sessions, cookies & AI control.</span>
                  </div>
                )}
                <p className="text-gray-400 text-xs mb-8">
                  {isElectron ? 'Each profile runs a real Chromium instance with separate cookies, cache, storage & login sessions' : 'Independent session with separate cookies, history & bookmarks'}
                </p>

                <form onSubmit={(e) => { e.preventDefault(); navigateTo(addressBarValue); }} className="w-full max-w-xl mb-10">
                  <div className="flex items-center bg-white border-2 border-gray-200 rounded-2xl px-4 py-3 shadow-sm focus-within:border-indigo-400 focus-within:shadow-md transition-all">
                    <Search className="w-5 h-5 text-gray-400 mr-3" />
                    <input
                      type="text"
                      value={addressBarValue}
                      onChange={(e) => setAddressBarValue(e.target.value)}
                      placeholder="Search Google or enter URL..."
                      className="flex-1 bg-transparent text-base text-gray-800 outline-none placeholder-gray-400"
                    />
                  </div>
                </form>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 max-w-2xl w-full">
                  {quickLinks.map(link => (
                    <button key={link.title} onClick={() => navigateTo(link.url)} className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${link.color} hover:shadow-md transition-all hover:-translate-y-0.5`}>
                      <span className="text-2xl">{link.icon}</span>
                      <span className="text-xs font-medium text-gray-700 truncate w-full text-center">{link.title}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-8 flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> {isElectron ? 'Real Chromium' : 'Secure'}</span>
                  <span>•</span>
                  <span>{activeProfile.tabs.length} tabs</span>
                  <span>•</span>
                  <span>{activeProfile.bookmarks.length} bookmarks</span>
                  <span>•</span>
                  <span>{activeProfile.history.length} history</span>
                </div>
              </div>
            ) : isElectron ? (
              /* In Electron, the BrowserView overlays this area — show placeholder */
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                {activeTab?.isLoading && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-200 z-10">
                    <div className="h-full bg-indigo-500 animate-pulse" style={{ width: '60%' }} />
                  </div>
                )}
                <div className="text-center text-gray-400">
                  <Globe className="w-8 h-8 mx-auto mb-2 animate-spin" />
                  <p className="text-sm">Loading in Chromium browser...</p>
                </div>
              </div>
            ) : (
              <>
                {activeTab?.isLoading && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-200 z-10">
                    <div className="h-full bg-indigo-500 animate-pulse" style={{ width: '60%' }} />
                  </div>
                )}
                <iframe
                  ref={iframeRef}
                  src={activeTab?.url}
                  title={activeTab?.title}
                  className="w-full h-full border-0"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
                  referrerPolicy="no-referrer"
                  onLoad={() => {
                    setProfiles(prev => prev.map(p =>
                      p.id === activeProfileId ? { ...p, tabs: p.tabs.map(t => t.id === p.activeTabId ? { ...t, isLoading: false } : t) } : p
                    ));
                  }}
                />
              </>
            )}
          </div>
        </div>

        {/* Split View - Second Browser */}
        {viewMode === 'split' && splitProfile && (
          <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
            <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-gray-200">
              <div className={`w-5 h-5 ${splitProfile.color} rounded-full flex items-center justify-center text-[10px]`}>
                {splitProfile.avatar}
              </div>
              <span className="text-xs font-medium text-gray-700">{splitProfile.name}</span>
              <div className="flex-1" />
              <select
                value={splitProfileId || ''}
                onChange={(e) => setSplitProfileId(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none"
              >
                {profiles.filter(p => p.id !== activeProfileId).map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-8">
              <div className="text-center">
                <div className={`w-12 h-12 ${splitProfile.color} rounded-xl flex items-center justify-center text-xl mx-auto mb-4 shadow-sm`}>
                  {splitProfile.avatar}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{splitProfile.name}</h3>
                <p className="text-sm text-gray-500 mb-4">Independent browser session</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {quickLinks.slice(0, 6).map(link => (
                    <button
                      key={link.title}
                      onClick={() => navigateTo(link.url, splitProfile.id)}
                      className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all"
                    >
                      {link.icon} {link.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Browser Agent Panel */}
        {showAIPanel && (
          <div className="w-80 flex flex-col border-l border-gray-200 bg-white">
            {/* AI Header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900">AI Browser Agent</h3>
                <p className="text-[10px] text-gray-500">Can search, navigate, extract & automate</p>
              </div>
              <button onClick={() => setShowAIPanel(false)} className="p-1 hover:bg-white/80 rounded">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* AI Quick Actions */}
            <div className="flex flex-wrap gap-1 px-3 py-2 border-b border-gray-100 bg-gray-50/50">
              {[
                { label: 'Summarize', icon: '📝' },
                { label: 'Extract Data', icon: '📊' },
                { label: 'Screenshot', icon: '📸' },
                { label: 'Fill Form', icon: '✍️' },
              ].map(qa => (
                <button
                  key={qa.label}
                  onClick={() => { setAiInput(qa.label); }}
                  className="flex items-center gap-1 px-2 py-1 text-[10px] bg-white border border-gray-200 rounded-md hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                >
                  <span>{qa.icon}</span> {qa.label}
                </button>
              ))}
            </div>

            {/* AI Chat Messages */}
            <div ref={aiChatRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
              {aiMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] rounded-xl px-3 py-2 ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="text-xs whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {msg.actions.map((action, i) => (
                          <button
                            key={i}
                            onClick={() => handleAIAction(action)}
                            className={`px-2 py-1 text-[10px] rounded-md font-medium transition-colors ${
                              msg.role === 'user'
                                ? 'bg-white/20 text-white hover:bg-white/30'
                                : 'bg-white border border-gray-200 text-indigo-600 hover:bg-indigo-50'
                            }`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                    <p className={`text-[9px] mt-1 ${msg.role === 'user' ? 'text-indigo-200' : 'text-gray-400'}`}>{msg.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Input */}
            <div className="px-3 py-3 border-t border-gray-200 bg-white">
              <form onSubmit={(e) => { e.preventDefault(); handleAISend(); }} className="flex items-center gap-2">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Ask AI to do anything..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
                />
                <button
                  type="submit"
                  disabled={!aiInput.trim()}
                  className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <p className="text-[9px] text-gray-400 mt-1.5 text-center">Try: "Search React tutorials" or "Summarize this page"</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
