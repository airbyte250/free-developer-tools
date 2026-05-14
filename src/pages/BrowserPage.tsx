import { useState, useRef, useCallback } from 'react';
import {
  Globe, ArrowLeft, ArrowRight, RotateCcw, Home, Star, StarOff,
  Plus, X, Search, ExternalLink, Shield, Lock, Bookmark,
  ChevronDown, Clock, Trash2
} from 'lucide-react';

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

export default function BrowserPage() {
  const [tabs, setTabs] = useState<BrowserTab[]>([
    { id: 'tab-1', title: 'New Tab', url: HOME_URL, favicon: '🏠', isLoading: false },
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');
  const [addressBarValue, setAddressBarValue] = useState('');
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(defaultBookmarks);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [navHistory, setNavHistory] = useState<Record<string, { stack: string[]; index: number }>>({
    'tab-1': { stack: [''], index: 0 },
  });
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activeTab = tabs.find(t => t.id === activeTabId) ?? tabs[0];
  const currentNavHistory = navHistory[activeTabId] ?? { stack: [''], index: 0 };

  const canGoBack = currentNavHistory.index > 0;
  const canGoForward = currentNavHistory.index < currentNavHistory.stack.length - 1;

  const isBookmarked = activeTab.url ? bookmarks.some(b => b.url === activeTab.url) : false;

  const navigateTo = useCallback((url: string) => {
    const processedUrl = ensureProtocol(url);
    const tabId = activeTabId;

    setTabs(prev => prev.map(t =>
      t.id === tabId ? { ...t, url: processedUrl, title: processedUrl ? getDomain(processedUrl) : 'New Tab', isLoading: !!processedUrl } : t
    ));
    setAddressBarValue(processedUrl);

    if (processedUrl) {
      setNavHistory(prev => {
        const cur = prev[tabId] ?? { stack: [''], index: 0 };
        const newStack = [...cur.stack.slice(0, cur.index + 1), processedUrl];
        return { ...prev, [tabId]: { stack: newStack, index: newStack.length - 1 } };
      });

      setHistory(prev => [
        { id: `h-${Date.now()}`, title: getDomain(processedUrl), url: processedUrl, visitedAt: new Date().toLocaleTimeString() },
        ...prev.slice(0, 49),
      ]);
    }

    setTimeout(() => {
      setTabs(prev => prev.map(t => t.id === tabId ? { ...t, isLoading: false } : t));
    }, 1500);
  }, [activeTabId]);

  const goBack = () => {
    if (!canGoBack) return;
    const newIndex = currentNavHistory.index - 1;
    const url = currentNavHistory.stack[newIndex];
    setNavHistory(prev => ({ ...prev, [activeTabId]: { ...currentNavHistory, index: newIndex } }));
    setTabs(prev => prev.map(t =>
      t.id === activeTabId ? { ...t, url, title: url ? getDomain(url) : 'New Tab', isLoading: !!url } : t
    ));
    setAddressBarValue(url);
    setTimeout(() => {
      setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, isLoading: false } : t));
    }, 1000);
  };

  const goForward = () => {
    if (!canGoForward) return;
    const newIndex = currentNavHistory.index + 1;
    const url = currentNavHistory.stack[newIndex];
    setNavHistory(prev => ({ ...prev, [activeTabId]: { ...currentNavHistory, index: newIndex } }));
    setTabs(prev => prev.map(t =>
      t.id === activeTabId ? { ...t, url, title: url ? getDomain(url) : 'New Tab', isLoading: !!url } : t
    ));
    setAddressBarValue(url);
    setTimeout(() => {
      setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, isLoading: false } : t));
    }, 1000);
  };

  const refresh = () => {
    if (!activeTab.url) return;
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, isLoading: true } : t));
    if (iframeRef.current) {
      iframeRef.current.src = activeTab.url;
    }
    setTimeout(() => {
      setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, isLoading: false } : t));
    }, 1500);
  };

  const goHome = () => {
    navigateTo('');
    setAddressBarValue('');
  };

  const addTab = () => {
    const id = `tab-${Date.now()}`;
    setTabs(prev => [...prev, { id, title: 'New Tab', url: HOME_URL, favicon: '🏠', isLoading: false }]);
    setNavHistory(prev => ({ ...prev, [id]: { stack: [''], index: 0 } }));
    setActiveTabId(id);
    setAddressBarValue('');
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return;
    const idx = tabs.findIndex(t => t.id === tabId);
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    if (activeTabId === tabId) {
      const newActive = newTabs[Math.min(idx, newTabs.length - 1)];
      setActiveTabId(newActive.id);
      setAddressBarValue(newActive.url);
    }
    setNavHistory(prev => {
      const copy = { ...prev };
      delete copy[tabId];
      return copy;
    });
  };

  const switchTab = (tabId: string) => {
    setActiveTabId(tabId);
    const tab = tabs.find(t => t.id === tabId);
    setAddressBarValue(tab?.url ?? '');
    setShowBookmarks(false);
    setShowHistory(false);
  };

  const toggleBookmark = () => {
    if (!activeTab.url) return;
    if (isBookmarked) {
      setBookmarks(prev => prev.filter(b => b.url !== activeTab.url));
    } else {
      setBookmarks(prev => [...prev, {
        id: `bm-${Date.now()}`,
        title: activeTab.title,
        url: activeTab.url,
        favicon: '⭐',
      }]);
    }
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo(addressBarValue);
  };

  const isHomePage = !activeTab.url;

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Tab Bar */}
      <div className="flex items-center bg-gray-100 border-b border-gray-200 px-2 pt-2 gap-1 min-h-[42px]">
        <div className="flex items-center gap-1 flex-1 overflow-x-auto scrollbar-thin">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-sm max-w-[200px] min-w-[120px] transition-all ${
                tab.id === activeTabId
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
              {tabs.length > 1 && (
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
        <button
          onClick={addTab}
          className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0 ml-1"
          title="New Tab"
        >
          <Plus className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Navigation Bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-gray-200">
        <div className="flex items-center gap-1">
          <button
            onClick={goBack}
            disabled={!canGoBack}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={goForward}
            disabled={!canGoForward}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Forward"
          >
            <ArrowRight className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={refresh}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            title="Refresh"
          >
            <RotateCcw className={`w-4 h-4 text-gray-600 ${activeTab.isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={goHome}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            title="Home"
          >
            <Home className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Address Bar */}
        <form onSubmit={handleAddressSubmit} className="flex-1">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
            {activeTab.url ? (
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
            {activeTab.url && (
              <button
                type="button"
                onClick={() => window.open(activeTab.url, '_blank')}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title="Open in new window"
              >
                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>
        </form>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleBookmark}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            title={isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
          >
            {isBookmarked ? (
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            ) : (
              <StarOff className="w-4 h-4 text-gray-400" />
            )}
          </button>
          <div className="relative">
            <button
              onClick={() => { setShowBookmarks(!showBookmarks); setShowHistory(false); }}
              className={`p-1.5 rounded-lg transition-colors ${showBookmarks ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'}`}
              title="Bookmarks"
            >
              <Bookmark className="w-4 h-4" />
            </button>
            {showBookmarks && (
              <div className="absolute right-0 top-10 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-50 py-2 max-h-80 overflow-y-auto">
                <div className="px-3 py-2 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900">Bookmarks</h3>
                </div>
                {bookmarks.map(bm => (
                  <button
                    key={bm.id}
                    onClick={() => { navigateTo(bm.url); setShowBookmarks(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50 transition-colors text-left"
                  >
                    <span className="text-sm">{bm.favicon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{bm.title}</p>
                      <p className="text-xs text-gray-400 truncate">{bm.url}</p>
                    </div>
                  </button>
                ))}
                {bookmarks.length === 0 && (
                  <p className="text-sm text-gray-400 px-3 py-4 text-center">No bookmarks yet</p>
                )}
              </div>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => { setShowHistory(!showHistory); setShowBookmarks(false); }}
              className={`p-1.5 rounded-lg transition-colors ${showHistory ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'}`}
              title="History"
            >
              <Clock className="w-4 h-4" />
            </button>
            {showHistory && (
              <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 py-2 max-h-80 overflow-y-auto">
                <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">History</h3>
                  {history.length > 0 && (
                    <button
                      onClick={() => setHistory([])}
                      className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear
                    </button>
                  )}
                </div>
                {history.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { navigateTo(item.url); setShowHistory(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50 transition-colors text-left"
                  >
                    <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                      <p className="text-xs text-gray-400 truncate">{item.url}</p>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{item.visitedAt}</span>
                  </button>
                ))}
                {history.length === 0 && (
                  <p className="text-sm text-gray-400 px-3 py-4 text-center">No history yet</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bookmarks Bar */}
      <div className="flex items-center gap-1 px-3 py-1 bg-gray-50/80 border-b border-gray-100 overflow-x-auto">
        {bookmarks.slice(0, 10).map(bm => (
          <button
            key={bm.id}
            onClick={() => navigateTo(bm.url)}
            className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200/70 rounded-md transition-colors whitespace-nowrap"
          >
            <span className="text-[10px]">{bm.favicon}</span>
            {bm.title}
          </button>
        ))}
        <button
          onClick={() => setShowBookmarks(true)}
          className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-200/70 rounded-md transition-colors"
        >
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-white relative">
        {isHomePage ? (
          <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-gray-50 to-white p-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">WorkSpace Browser</h2>
            <p className="text-gray-500 mb-8">Browse the web without leaving your workspace</p>

            {/* Search Bar */}
            <form
              onSubmit={(e) => { e.preventDefault(); navigateTo(addressBarValue); }}
              className="w-full max-w-xl mb-10"
            >
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

            {/* Quick Links Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 max-w-2xl w-full">
              {quickLinks.map(link => (
                <button
                  key={link.title}
                  onClick={() => navigateTo(link.url)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${link.color} hover:shadow-md transition-all hover:-translate-y-0.5`}
                >
                  <span className="text-2xl">{link.icon}</span>
                  <span className="text-xs font-medium text-gray-700 truncate w-full text-center">{link.title}</span>
                </button>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Secure browsing</span>
              <span>•</span>
              <span>{tabs.length} tab{tabs.length > 1 ? 's' : ''} open</span>
              <span>•</span>
              <span>{bookmarks.length} bookmarks</span>
              <span>•</span>
              <span>{history.length} history items</span>
            </div>
          </div>
        ) : (
          <>
            {activeTab.isLoading && (
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-200 z-10">
                <div className="h-full bg-indigo-500 animate-pulse" style={{ width: '60%' }} />
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={activeTab.url}
              title={activeTab.title}
              className="w-full h-full border-0"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
              referrerPolicy="no-referrer"
              onLoad={() => {
                setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, isLoading: false } : t));
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
