import { useState } from 'react';
import { Building2, Users, Shield, Bell, Palette, Globe, Key, Database } from 'lucide-react';

const tabs = [
  { id: 'general', label: 'General', icon: Building2 },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your workspace preferences and configuration</p>
      </div>

      <div className="flex gap-6">
        <div className="w-56 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1">
          {activeTab === 'general' && (
            <div className="card space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Workspace Information</h2>
                <p className="text-sm text-gray-500">Update your workspace details</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Workspace Name</label>
                  <input type="text" defaultValue="Airbyte Technologies" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <input type="text" defaultValue="Technology" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                  <select className="input-field">
                    <option>1-10</option>
                    <option selected>11-50</option>
                    <option>51-200</option>
                    <option>200+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                  <select className="input-field">
                    <option selected>Asia/Kolkata (IST)</option>
                    <option>America/New_York (EST)</option>
                    <option>Europe/London (GMT)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea className="input-field h-20" defaultValue="Building the future of technology with a passionate team." />
                </div>
              </div>
              <div className="flex justify-end">
                <button className="btn-primary">Save Changes</button>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="card space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Manage Members</h2>
                  <p className="text-sm text-gray-500">Control who has access to your workspace</p>
                </div>
                <button className="btn-primary">Invite Members</button>
              </div>
              <div className="space-y-3">
                {[
                  { role: 'Admin', desc: 'Full access to all workspace features, settings, and billing', count: 1 },
                  { role: 'Manager', desc: 'Can manage projects, teams, and view reports', count: 2 },
                  { role: 'Employee', desc: 'Standard access to assigned projects and tasks', count: 7 },
                ].map(r => (
                  <div key={r.role} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{r.role}</h3>
                      <p className="text-xs text-gray-500">{r.desc}</p>
                    </div>
                    <span className="badge bg-indigo-100 text-indigo-700">{r.count} members</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Security Settings</h2>
                <p className="text-sm text-gray-500">Protect your workspace data and access</p>
              </div>
              <div className="space-y-4">
                {[
                  { icon: Shield, title: 'Two-Factor Authentication', desc: 'Require 2FA for all members', enabled: true },
                  { icon: Key, title: 'SSO Login', desc: 'Enable Single Sign-On with your identity provider', enabled: false },
                  { icon: Globe, title: 'IP Whitelisting', desc: 'Restrict access to specific IP addresses', enabled: false },
                  { icon: Database, title: 'Data Encryption', desc: 'Encrypt all workspace data at rest', enabled: true },
                ].map(item => (
                  <div key={item.title} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <item.icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                    <button className={`relative w-11 h-6 rounded-full transition-colors ${item.enabled ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${item.enabled ? 'left-5.5' : 'left-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Notification Preferences</h2>
                <p className="text-sm text-gray-500">Control how you receive notifications</p>
              </div>
              <div className="space-y-4">
                {[
                  { title: 'Task Assignments', desc: 'When a task is assigned to you', email: true, push: true },
                  { title: 'Project Updates', desc: 'When a project you follow is updated', email: true, push: false },
                  { title: 'Chat Messages', desc: 'New messages in your channels', email: false, push: true },
                  { title: 'Leave Approvals', desc: 'When a leave request needs approval', email: true, push: true },
                  { title: 'Weekly Reports', desc: 'Weekly summary of workspace activity', email: true, push: false },
                  { title: 'Team Changes', desc: 'When team members join or leave', email: true, push: false },
                ].map(item => (
                  <div key={item.title} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-xs text-gray-600">
                        <input type="checkbox" defaultChecked={item.email} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        Email
                      </label>
                      <label className="flex items-center gap-2 text-xs text-gray-600">
                        <input type="checkbox" defaultChecked={item.push} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        Push
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="card space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Appearance</h2>
                <p className="text-sm text-gray-500">Customize how your workspace looks</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Theme</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { name: 'Light', bg: 'bg-white', active: true },
                    { name: 'Dark', bg: 'bg-gray-900', active: false },
                    { name: 'System', bg: 'bg-gradient-to-r from-white to-gray-900', active: false },
                  ].map(theme => (
                    <button key={theme.name} className={`p-4 rounded-xl border-2 transition-colors ${theme.active ? 'border-indigo-500' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className={`w-full h-16 rounded-lg ${theme.bg} border border-gray-200 mb-2`} />
                      <p className="text-sm font-medium text-gray-700">{theme.name}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Accent Color</h3>
                <div className="flex gap-3">
                  {['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map(color => (
                    <button key={color} className="w-10 h-10 rounded-full border-2 border-transparent hover:border-gray-300 transition-colors" style={{ backgroundColor: color }}>
                      {color === '#6366f1' && <span className="text-white text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Sidebar Style</h3>
                <div className="flex gap-3">
                  <button className="px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-medium border-2 border-indigo-500">Expanded</button>
                  <button className="px-4 py-2 rounded-lg bg-gray-50 text-gray-600 text-sm font-medium border-2 border-gray-200">Compact</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
