import { useState } from 'react';
import { Search, ArrowUpRight, GitBranch, FileText, MessageSquare, FolderKanban, CheckCircle2 } from 'lucide-react';
import { activityLogs, users } from '../data/mockData';
import { format } from 'date-fns';

const actionIcons: Record<string, typeof GitBranch> = {
  updated: ArrowUpRight,
  completed: CheckCircle2,
  uploaded: FileText,
  created: FolderKanban,
  commented: MessageSquare,
  approved: CheckCircle2,
  shared: FileText,
  deployed: GitBranch,
  sent: MessageSquare,
  merged: GitBranch,
};

const actionColors: Record<string, string> = {
  updated: 'bg-blue-100 text-blue-600',
  completed: 'bg-emerald-100 text-emerald-600',
  uploaded: 'bg-purple-100 text-purple-600',
  created: 'bg-indigo-100 text-indigo-600',
  commented: 'bg-cyan-100 text-cyan-600',
  approved: 'bg-green-100 text-green-600',
  shared: 'bg-amber-100 text-amber-600',
  deployed: 'bg-teal-100 text-teal-600',
  sent: 'bg-pink-100 text-pink-600',
  merged: 'bg-violet-100 text-violet-600',
};

const filterOptions = ['All', 'Tasks', 'Projects', 'Documents', 'Messages', 'Members'];

export default function Activity() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const getUserName = (id: string) => users.find(u => u.id === id)?.name ?? 'Unknown';

  const getUserDept = (id: string) => users.find(u => u.id === id)?.department ?? '';

  const filtered = activityLogs.filter(log => {
    if (filter !== 'All') {
      const typeMap: Record<string, string> = { Tasks: 'task', Projects: 'project', Documents: 'document', Messages: 'message', Members: 'member' };
      if (log.targetType !== typeMap[filter]) return false;
    }
    if (search) {
      const s = search.toLowerCase();
      return log.target.toLowerCase().includes(s) || getUserName(log.userId).toLowerCase().includes(s) || log.action.toLowerCase().includes(s);
    }
    return true;
  });

  const today = filtered.filter(l => new Date(l.timestamp).toDateString() === new Date('2024-03-15').toDateString());
  const yesterday = filtered.filter(l => new Date(l.timestamp).toDateString() === new Date('2024-03-14').toDateString());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Feed</h1>
          <p className="text-sm text-gray-500 mt-1">Track everything happening in your workspace</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" placeholder="Search activity..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {filterOptions.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >{f}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Actions', value: activityLogs.length, color: 'text-indigo-600' },
          { label: 'Tasks Updated', value: activityLogs.filter(l => l.targetType === 'task').length, color: 'text-blue-600' },
          { label: 'Docs Shared', value: activityLogs.filter(l => l.targetType === 'document').length, color: 'text-purple-600' },
          { label: 'Messages', value: activityLogs.filter(l => l.targetType === 'message').length, color: 'text-cyan-600' },
          { label: 'Active Members', value: new Set(activityLogs.map(l => l.userId)).size, color: 'text-emerald-600' },
        ].map(s => (
          <div key={s.label} className="stat-card text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {today.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Today</h2>
          <div className="space-y-2">
            {today.map(log => {
              const Icon = actionIcons[log.action] ?? ArrowUpRight;
              return (
                <div key={log.id} className="card py-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${actionColors[log.action] ?? 'bg-gray-100 text-gray-600'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-gray-900">{getUserName(log.userId)}</span>{' '}
                      <span className="text-gray-500">{log.action}</span>{' '}
                      <span className="font-medium text-indigo-600">{log.target}</span>
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400">{log.details}</span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-400">{getUserDept(log.userId)}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{format(new Date(log.timestamp), 'h:mm a')}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {yesterday.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Yesterday</h2>
          <div className="space-y-2">
            {yesterday.map(log => {
              const Icon = actionIcons[log.action] ?? ArrowUpRight;
              return (
                <div key={log.id} className="card py-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${actionColors[log.action] ?? 'bg-gray-100 text-gray-600'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-gray-900">{getUserName(log.userId)}</span>{' '}
                      <span className="text-gray-500">{log.action}</span>{' '}
                      <span className="font-medium text-indigo-600">{log.target}</span>
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400">{log.details}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{format(new Date(log.timestamp), 'h:mm a')}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
