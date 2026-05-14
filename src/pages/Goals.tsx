import { useState } from 'react';
import { Target, Plus, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { goals, users } from '../data/mockData';

const statusColors: Record<string, string> = {
  'on-track': 'badge-success',
  'at-risk': 'badge-warning',
  'behind': 'badge-danger',
  'completed': 'badge-info',
};



export default function Goals() {
  const [filter, setFilter] = useState<'all' | 'company' | 'team' | 'personal'>('all');
  const getUserName = (id: string) => users.find(u => u.id === id)?.name ?? 'Unknown';

  const filtered = goals.filter(g => filter === 'all' || g.type === filter);

  const avgProgress = Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length);
  const onTrack = goals.filter(g => g.status === 'on-track').length;
  const atRisk = goals.filter(g => g.status === 'at-risk').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Goals & OKRs</h1>
          <p className="text-sm text-gray-500 mt-1">Track objectives and key results across teams</p>
        </div>
        <button className="btn-primary"><Plus className="w-4 h-4" /> New Goal</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{goals.length}</p>
              <p className="text-xs text-gray-500">Total Goals</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{avgProgress}%</p>
              <p className="text-xs text-gray-500">Avg Progress</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{onTrack}</p>
              <p className="text-xs text-gray-500">On Track</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{atRisk}</p>
              <p className="text-xs text-gray-500">At Risk</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-1">
        {(['all', 'company', 'team', 'personal'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >{f}</button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map(goal => (
          <div key={goal.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                  <span className={`badge ${statusColors[goal.status]}`}>{goal.status.replace('-', ' ')}</span>
                  <span className="badge bg-gray-100 text-gray-600 capitalize">{goal.type}</span>
                </div>
                <p className="text-sm text-gray-500">{goal.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span>Owner: {getUserName(goal.ownerId)}</span>
                  <span>Due: {goal.dueDate}</span>
                </div>
              </div>
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                  <circle cx="32" cy="32" r="28" fill="none" strokeWidth="4" strokeLinecap="round"
                    className={goal.status === 'on-track' ? 'stroke-emerald-500' : goal.status === 'at-risk' ? 'stroke-amber-500' : 'stroke-red-500'}
                    strokeDasharray={`${goal.progress * 1.76} 176`}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-900">{goal.progress}%</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">Key Results</h4>
              {goal.keyResults.map(kr => {
                const pct = Math.round((kr.current / kr.target) * 100);
                return (
                  <div key={kr.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700">{kr.title}</span>
                      <span className="text-xs font-semibold text-gray-500">{kr.current} / {kr.target} {kr.unit}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
