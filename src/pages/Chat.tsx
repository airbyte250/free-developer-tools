import { useState } from 'react';
import { Hash, Lock, Send, Smile, Paperclip, Search, Plus, Users, Settings as SettingsIcon } from 'lucide-react';
import { chatChannels, chatMessages, users } from '../data/mockData';

export default function Chat() {
  const [selectedChannel, setSelectedChannel] = useState(chatChannels[0].id);
  const [message, setMessage] = useState('');

  const channelMessages = chatMessages.filter(m => m.channelId === selectedChannel);
  const currentChannel = chatChannels.find(c => c.id === selectedChannel);
  const getUserName = (id: string) => users.find(u => u.id === id)?.name ?? 'Unknown';
  const getUserAvatar = (id: string) => users.find(u => u.id === id)?.avatar ?? '??';
  const getUserStatus = (id: string) => users.find(u => u.id === id)?.status ?? 'offline';

  const statusDot: Record<string, string> = {
    online: 'bg-emerald-500', offline: 'bg-gray-400', away: 'bg-amber-500', busy: 'bg-red-500',
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="w-72 border-r border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Channels</h2>
            <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Plus className="w-4 h-4 text-gray-500" /></button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input type="text" placeholder="Search channels..." className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {chatChannels.map(ch => (
            <button
              key={ch.id}
              onClick={() => setSelectedChannel(ch.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors ${
                selectedChannel === ch.id ? 'bg-indigo-50 border-r-2 border-indigo-600' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                selectedChannel === ch.id ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
              }`}>
                {ch.type === 'private' ? <Lock className="w-4 h-4" /> : <Hash className="w-4 h-4" />}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className={`text-sm font-medium truncate ${selectedChannel === ch.id ? 'text-indigo-700' : 'text-gray-700'}`}>{ch.name}</p>
                <p className="text-xs text-gray-400 truncate">{ch.members.length} members</p>
              </div>
              {ch.unreadCount > 0 && (
                <span className="w-5 h-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center">{ch.unreadCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
              {currentChannel?.type === 'private' ? <Lock className="w-5 h-5" /> : <Hash className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{currentChannel?.name}</h3>
              <p className="text-xs text-gray-500">{currentChannel?.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {currentChannel?.members.slice(0, 4).map(id => (
                <div key={id} className="w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-semibold border-2 border-white" title={getUserName(id)}>
                  {getUserAvatar(id)}
                </div>
              ))}
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg"><Users className="w-4 h-4 text-gray-500" /></button>
            <button className="p-2 hover:bg-gray-100 rounded-lg"><SettingsIcon className="w-4 h-4 text-gray-500" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {channelMessages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-3">
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {getUserAvatar(msg.senderId)}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${statusDot[getUserStatus(msg.senderId)]} rounded-full border-2 border-white`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{getUserName(msg.senderId)}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-1 leading-relaxed">{msg.content}</p>
                {msg.reactions.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {msg.reactions.map((r, i) => (
                      <button key={i} className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs transition-colors">
                        <span>{r.emoji}</span>
                        <span className="text-gray-500">{r.users.length}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-200 px-4 py-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent">
            <button className="text-gray-400 hover:text-gray-600"><Paperclip className="w-5 h-5" /></button>
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={`Message #${currentChannel?.name}...`}
              className="flex-1 bg-transparent text-sm focus:outline-none"
              onKeyDown={e => { if (e.key === 'Enter' && message.trim()) setMessage(''); }}
            />
            <button className="text-gray-400 hover:text-gray-600"><Smile className="w-5 h-5" /></button>
            <button
              onClick={() => setMessage('')}
              className={`p-2 rounded-lg transition-colors ${message.trim() ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400'}`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
