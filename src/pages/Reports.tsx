import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Download, Calendar, TrendingUp, Users, Clock, CheckCircle2 } from 'lucide-react';

const monthlyTasks = [
  { month: 'Jan', completed: 45, created: 52 },
  { month: 'Feb', completed: 58, created: 48 },
  { month: 'Mar', completed: 62, created: 55 },
  { month: 'Apr', completed: 48, created: 60 },
  { month: 'May', completed: 70, created: 65 },
  { month: 'Jun', completed: 75, created: 58 },
];

const departmentPerformance = [
  { name: 'Engineering', productivity: 92, tasks: 45 },
  { name: 'Design', productivity: 88, tasks: 22 },
  { name: 'Marketing', productivity: 85, tasks: 18 },
  { name: 'HR', productivity: 90, tasks: 15 },
  { name: 'Sales', productivity: 78, tasks: 20 },
];

const projectBudget = [
  { name: 'E-Commerce', budget: 100, spent: 68, color: '#6366f1' },
  { name: 'Mobile App', budget: 80, spent: 45, color: '#06b6d4' },
  { name: 'Marketing', budget: 50, spent: 20, color: '#f59e0b' },
  { name: 'HR Portal', budget: 60, spent: 49, color: '#10b981' },
  { name: 'Analytics', budget: 40, spent: 14, color: '#8b5cf6' },
];

const teamHours = [
  { name: 'Engineering', hours: 180, color: '#6366f1' },
  { name: 'Design', hours: 82, color: '#ec4899' },
  { name: 'Marketing', hours: 48, color: '#f59e0b' },
  { name: 'HR', hours: 42, color: '#10b981' },
  { name: 'Sales', hours: 36, color: '#06b6d4' },
];

const revenueData = [
  { month: 'Jan', revenue: 12 },
  { month: 'Feb', revenue: 15 },
  { month: 'Mar', revenue: 18 },
  { month: 'Apr', revenue: 22 },
  { month: 'May', revenue: 28 },
  { month: 'Jun', revenue: 32 },
];

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Insights and performance metrics for your workspace</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary"><Calendar className="w-4 h-4" /> This Month</button>
          <button className="btn-primary"><Download className="w-4 h-4" /> Export</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: CheckCircle2, label: 'Tasks Completed', value: '358', change: '+12%', color: 'bg-emerald-500' },
          { icon: Users, label: 'Active Members', value: '10', change: '+2', color: 'bg-indigo-500' },
          { icon: Clock, label: 'Total Hours', value: '1,245', change: '+8%', color: 'bg-cyan-500' },
          { icon: TrendingUp, label: 'Productivity Score', value: '92%', change: '+5%', color: 'bg-amber-500' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-emerald-600">{s.change}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-3">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Tasks Overview (Monthly)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyTasks}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed" />
              <Bar dataKey="created" fill="#6366f1" radius={[4, 4, 0, 0]} name="Created" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Revenue Growth (Lakh)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Hours by Department</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={teamHours} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="hours">
                {teamHours.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {teamHours.map(t => (
              <div key={t.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="text-xs text-gray-600">{t.name}</span>
                </div>
                <span className="text-xs font-semibold text-gray-900">{t.hours}h</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Department Productivity</h2>
          <div className="space-y-4">
            {departmentPerformance.map(dept => (
              <div key={dept.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{dept.name}</span>
                  <span className="text-sm font-semibold text-gray-900">{dept.productivity}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      dept.productivity >= 90 ? 'bg-emerald-500' :
                      dept.productivity >= 80 ? 'bg-indigo-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${dept.productivity}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Project Budget</h2>
          <div className="space-y-4">
            {projectBudget.map(p => (
              <div key={p.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{p.name}</span>
                  <span className="text-xs text-gray-500">{p.spent}L / {p.budget}L</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width: `${(p.spent / p.budget) * 100}%`, backgroundColor: p.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Team Performance Overview</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Department</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Productivity</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tasks Done</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Hours Logged</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Rating</th>
              </tr>
            </thead>
            <tbody>
              {departmentPerformance.map(dept => (
                <tr key={dept.name} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{dept.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-100 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-indigo-500" style={{ width: `${dept.productivity}%` }} />
                      </div>
                      <span className="text-sm text-gray-700">{dept.productivity}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{dept.tasks}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{teamHours.find(t => t.name === dept.name)?.hours ?? 0}h</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${
                      dept.productivity >= 90 ? 'badge-success' :
                      dept.productivity >= 80 ? 'badge-info' : 'badge-warning'
                    }`}>
                      {dept.productivity >= 90 ? 'Excellent' : dept.productivity >= 80 ? 'Good' : 'Average'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
