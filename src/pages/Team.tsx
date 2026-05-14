import { useState } from 'react';
import { Search, Plus, Mail, Phone, MoreVertical, LayoutGrid, List } from 'lucide-react';
import { users } from '../data/mockData';

const departments = ['All', 'Engineering', 'Design', 'Marketing', 'HR', 'Sales'];

const statusDot: Record<string, string> = {
  online: 'bg-emerald-500',
  offline: 'bg-gray-400',
  away: 'bg-amber-500',
  busy: 'bg-red-500',
};

const roleBadge: Record<string, string> = {
  admin: 'badge-purple',
  manager: 'badge-info',
  employee: 'badge-success',
};

export default function Team() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [dept, setDept] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = users.filter(u =>
    (dept === 'All' || u.department === dept) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team</h1>
          <p className="text-sm text-gray-500 mt-1">{users.length} members across {departments.length - 1} departments</p>
        </div>
        <button className="btn-primary"><Plus className="w-4 h-4" /> Add Member</button>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text" placeholder="Search members..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {departments.map(d => (
              <button key={d} onClick={() => setDept(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  dept === d ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button onClick={() => setView('grid')} className={`p-2 rounded-md ${view === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'}`}>
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button onClick={() => setView('list')} className={`p-2 rounded-md ${view === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'}`}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((user) => (
            <div key={user.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-md">
                    {user.avatar}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${statusDot[user.status]} rounded-full border-2 border-white`} />
                </div>
                <button className="text-gray-400 hover:text-gray-600"><MoreVertical className="w-4 h-4" /></button>
              </div>
              <h3 className="font-semibold text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-500">{user.position}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`badge ${roleBadge[user.role]}`}>{user.role}</span>
                <span className="badge bg-gray-100 text-gray-600">{user.department}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Mail className="w-3.5 h-3.5" /> {user.email}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Phone className="w-3.5 h-3.5" /> {user.phone}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">Message</button>
                <button className="flex-1 py-2 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">Profile</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Department</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Contact</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-semibold">{user.avatar}</div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${statusDot[user.status]} rounded-full border-2 border-white`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.position}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.department}</td>
                  <td className="px-4 py-3"><span className={`badge ${roleBadge[user.role]}`}>{user.role}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 ${statusDot[user.status]} rounded-full`} />
                      <span className="text-xs text-gray-600 capitalize">{user.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{user.email}</td>
                  <td className="px-4 py-3"><button className="text-gray-400 hover:text-gray-600"><MoreVertical className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
