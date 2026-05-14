import { useState } from 'react';
import { Search, Bell, Plus, ChevronDown } from 'lucide-react';
import { notifications as notifData } from '../../data/mockData';

export default function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const unreadCount = notifData.filter(n => !n.read).length;

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded border">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="btn-primary text-xs py-1.5">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Task</span>
        </button>

        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 max-h-96 overflow-y-auto">
              <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-sm">Notifications</h3>
                <button className="text-xs text-indigo-600 hover:text-indigo-800">Mark all read</button>
              </div>
              {notifData.map((notif) => (
                <div key={notif.id} className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 ${!notif.read ? 'bg-indigo-50/50' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      notif.type === 'success' ? 'bg-emerald-500' :
                      notif.type === 'warning' ? 'bg-amber-500' :
                      notif.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              PK
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-900">Pawan Kumar</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          {showProfile && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold">Pawan Kumar</p>
                <p className="text-xs text-gray-500">pawan@company.com</p>
              </div>
              <div className="py-1">
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">My Profile</button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">Preferences</button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">Help & Support</button>
              </div>
              <div className="border-t border-gray-100 pt-1">
                <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">Sign Out</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
