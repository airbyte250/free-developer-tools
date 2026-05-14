import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, Users, MessageSquare, Calendar,
  Clock, BarChart3, FileText, UserCheck, Target, Settings,
  Activity, ChevronLeft, ChevronRight, Zap, Bot, Globe
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/projects', icon: FolderKanban, label: 'Projects' },
  { path: '/team', icon: Users, label: 'Team' },
  { path: '/chat', icon: MessageSquare, label: 'Chat' },
  { path: '/activity', icon: Activity, label: 'Activity' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/time-tracking', icon: Clock, label: 'Time Tracking' },
  { path: '/reports', icon: BarChart3, label: 'Reports' },
  { path: '/documents', icon: FileText, label: 'Documents' },
  { path: '/attendance', icon: UserCheck, label: 'Attendance' },
  { path: '/goals', icon: Target, label: 'Goals & OKRs' },
  { path: '/ai-agents', icon: Bot, label: 'AI Agents' },
  { path: '/browser', icon: Globe, label: 'Browser' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-gradient-to-b from-indigo-950 to-indigo-900 text-white flex flex-col transition-all duration-300 fixed left-0 top-0 h-screen z-30`}>
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-4 h-16 border-b border-indigo-800`}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">WorkSpace</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
        )}
        <button
          onClick={onToggle}
          className={`p-1.5 rounded-lg hover:bg-indigo-800 transition-colors ${collapsed ? 'absolute -right-3 top-5 bg-indigo-700 shadow-lg' : ''}`}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : ''} ${collapsed ? 'justify-center px-2' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-indigo-800">
          <div className="bg-indigo-800/50 rounded-lg p-3">
            <p className="text-xs text-indigo-300">Workspace Plan</p>
            <p className="text-sm font-semibold text-white">Enterprise</p>
            <div className="mt-2 w-full bg-indigo-700 rounded-full h-1.5">
              <div className="bg-indigo-400 h-1.5 rounded-full" style={{ width: '72%' }}></div>
            </div>
            <p className="text-xs text-indigo-300 mt-1">72% storage used</p>
          </div>
        </div>
      )}
    </aside>
  );
}
