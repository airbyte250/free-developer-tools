import { useState } from 'react';
import { Play, Pause, Clock, Plus, Calendar, Timer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { timeEntries, users, projects } from '../data/mockData';

const weekData = [
  { day: 'Mon', hours: 8.5 },
  { day: 'Tue', hours: 9.0 },
  { day: 'Wed', hours: 7.5 },
  { day: 'Thu', hours: 8.0 },
  { day: 'Fri', hours: 6.5 },
  { day: 'Sat', hours: 2.0 },
  { day: 'Sun', hours: 0 },
];

export default function TimeTracking() {
  const [isTracking, setIsTracking] = useState(false);
  const [currentTime] = useState('00:00:00');
  const [trackingDesc, setTrackingDesc] = useState('');

  const getProjectName = (id: string) => projects.find(p => p.id === id)?.name ?? 'Unknown';
  const getUserName = (id: string) => users.find(u => u.id === id)?.name ?? 'Unknown';

  const totalToday = timeEntries.filter(e => e.date === '2024-03-15').reduce((sum, e) => sum + e.duration, 0);
  const totalWeek = weekData.reduce((sum, d) => sum + d.hours, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Time Tracking</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage your work hours</p>
        </div>
        <button className="btn-primary"><Plus className="w-4 h-4" /> Manual Entry</button>
      </div>

      <div className="card bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-indigo-200">Current Timer</p>
            <div className="text-4xl font-mono font-bold mt-1">{currentTime}</div>
            <input
              type="text"
              value={trackingDesc}
              onChange={e => setTrackingDesc(e.target.value)}
              placeholder="What are you working on?"
              className="mt-3 bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-sm text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50 w-80"
            />
          </div>
          <button
            onClick={() => setIsTracking(!isTracking)}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${
              isTracking ? 'bg-red-500 hover:bg-red-600' : 'bg-white hover:bg-gray-100'
            }`}
          >
            {isTracking ? <Pause className="w-7 h-7 text-white" /> : <Play className="w-7 h-7 text-indigo-600 ml-0.5" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalToday}h</p>
              <p className="text-xs text-gray-500">Today</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
              <Timer className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalWeek}h</p>
              <p className="text-xs text-gray-500">This Week</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{timeEntries.length}</p>
              <p className="text-xs text-gray-500">Entries</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">8.0h</p>
              <p className="text-xs text-gray-500">Avg/Day</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Weekly Hours</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Today's Time Entries</h2>
          <div className="space-y-3">
            {timeEntries.filter(e => e.date === '2024-03-15').map(entry => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-semibold">
                    {users.find(u => u.id === entry.userId)?.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{entry.description}</p>
                    <p className="text-xs text-gray-500">{getUserName(entry.userId)} · {getProjectName(entry.projectId)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{entry.duration}h</p>
                  <p className="text-xs text-gray-500">{entry.startTime} - {entry.endTime}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
