import {
  Users, FolderKanban, CheckCircle2, Clock, TrendingUp, ArrowUpRight,
  ArrowDownRight, AlertCircle, MessageSquare, Calendar as CalendarIcon
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { users, projects, tasks, activityLogs, calendarEvents } from '../data/mockData';
import { format } from 'date-fns';

const tasksByStatus = [
  { name: 'To Do', value: tasks.filter(t => t.status === 'todo').length, color: '#6366f1' },
  { name: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, color: '#f59e0b' },
  { name: 'In Review', value: tasks.filter(t => t.status === 'review').length, color: '#06b6d4' },
  { name: 'Done', value: tasks.filter(t => t.status === 'done').length, color: '#10b981' },
];

const weeklyData = [
  { day: 'Mon', tasks: 8, hours: 42 },
  { day: 'Tue', tasks: 12, hours: 45 },
  { day: 'Wed', tasks: 10, hours: 38 },
  { day: 'Thu', tasks: 15, hours: 48 },
  { day: 'Fri', tasks: 9, hours: 36 },
  { day: 'Sat', tasks: 3, hours: 12 },
  { day: 'Sun', tasks: 1, hours: 4 },
];

const productivityData = [
  { week: 'W1', productivity: 72 },
  { week: 'W2', productivity: 78 },
  { week: 'W3', productivity: 85 },
  { week: 'W4', productivity: 82 },
  { week: 'W5', productivity: 90 },
  { week: 'W6', productivity: 88 },
  { week: 'W7', productivity: 92 },
  { week: 'W8', productivity: 95 },
];

const stats = [
  { label: 'Total Employees', value: users.length, icon: Users, color: 'bg-indigo-500', change: '+2', up: true },
  { label: 'Active Projects', value: projects.filter(p => p.status === 'active').length, icon: FolderKanban, color: 'bg-cyan-500', change: '+1', up: true },
  { label: 'Tasks Completed', value: tasks.filter(t => t.status === 'done').length, icon: CheckCircle2, color: 'bg-emerald-500', change: '+5', up: true },
  { label: 'Hours Logged Today', value: '67.5', icon: Clock, color: 'bg-amber-500', change: '-2.5', up: false },
];

export default function Dashboard() {
  const getUserName = (id: string) => users.find(u => u.id === id)?.name ?? 'Unknown';
  const getUserAvatar = (id: string) => users.find(u => u.id === id)?.avatar ?? '??';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, Pawan! Here's your workspace overview.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <CalendarIcon className="w-4 h-4" />
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${stat.up ? 'text-emerald-600' : 'text-red-500'}`}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Weekly Task Completion</h2>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <TrendingUp className="w-3 h-3" /> +12% from last week
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Bar dataKey="tasks" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Task Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={tasksByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {tasksByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {tasksByStatus.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-gray-600">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Team Productivity</h2>
            <span className="badge badge-success">+8%</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={productivityData}>
              <defs>
                <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Area type="monotone" dataKey="productivity" stroke="#6366f1" fillOpacity={1} fill="url(#colorProd)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Project Progress</h2>
          <div className="space-y-4">
            {projects.filter(p => p.status === 'active').map((project) => (
              <div key={project.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{project.name}</span>
                  <span className="text-xs font-semibold text-gray-500">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      project.progress >= 75 ? 'bg-emerald-500' :
                      project.progress >= 50 ? 'bg-indigo-500' :
                      project.progress >= 25 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Online Team Members</h2>
          <div className="space-y-3">
            {users.filter(u => u.status === 'online').slice(0, 5).map((user) => (
              <div key={user.id} className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-semibold">
                    {user.avatar}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.position}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Activity</h2>
            <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {activityLogs.slice(0, 6).map((log) => (
              <div key={log.id} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-semibold text-gray-600 flex-shrink-0">
                  {getUserAvatar(log.userId)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-gray-900">{getUserName(log.userId)}</span>{' '}
                    {log.action} <span className="font-medium text-indigo-600">{log.target}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{log.details} · {format(new Date(log.timestamp), 'h:mm a')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Upcoming Events</h2>
            <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">View Calendar</button>
          </div>
          <div className="space-y-3">
            {calendarEvents.slice(0, 5).map((event) => (
              <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-1 h-10 rounded-full" style={{ backgroundColor: event.color }} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{event.title}</p>
                  <p className="text-xs text-gray-500">{format(new Date(event.startDate), 'MMM d, h:mm a')}</p>
                </div>
                <span className={`badge ${
                  event.type === 'meeting' ? 'badge-info' :
                  event.type === 'deadline' ? 'badge-danger' :
                  event.type === 'event' ? 'badge-success' : 'badge-warning'
                }`}>
                  {event.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: FolderKanban, label: 'New Project', color: 'bg-indigo-100 text-indigo-600' },
              { icon: CheckCircle2, label: 'New Task', color: 'bg-emerald-100 text-emerald-600' },
              { icon: MessageSquare, label: 'Send Message', color: 'bg-cyan-100 text-cyan-600' },
              { icon: CalendarIcon, label: 'Schedule Meeting', color: 'bg-amber-100 text-amber-600' },
              { icon: Users, label: 'Add Member', color: 'bg-purple-100 text-purple-600' },
              { icon: AlertCircle, label: 'Report Issue', color: 'bg-red-100 text-red-600' },
            ].map((action) => (
              <button key={action.label} className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.color}`}>
                  <action.icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-gray-700">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Department Overview</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              { dept: 'Eng', members: 5 },
              { dept: 'Design', members: 2 },
              { dept: 'Marketing', members: 1 },
              { dept: 'HR', members: 1 },
              { dept: 'Sales', members: 1 },
            ]} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="dept" fontSize={11} tickLine={false} axisLine={false} width={60} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Bar dataKey="members" fill="#818cf8" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Hours Trend</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Line type="monotone" dataKey="hours" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
