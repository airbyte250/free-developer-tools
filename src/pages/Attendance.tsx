import { useState } from 'react';
import { Calendar, Clock, CheckCircle2, XCircle, Home, Search, Plus } from 'lucide-react';
import { attendanceRecords, leaveRequests, users } from '../data/mockData';

const statusBadge: Record<string, string> = {
  present: 'badge-success',
  absent: 'badge-danger',
  'half-day': 'badge-warning',
  wfh: 'badge-info',
  leave: 'badge-purple',
};

const leaveStatusBadge: Record<string, string> = {
  pending: 'badge-warning',
  approved: 'badge-success',
  rejected: 'badge-danger',
};

const leaveTypeBadge: Record<string, string> = {
  sick: 'bg-red-100 text-red-700',
  casual: 'bg-blue-100 text-blue-700',
  annual: 'bg-purple-100 text-purple-700',
  wfh: 'bg-cyan-100 text-cyan-700',
};

export default function Attendance() {
  const [tab, setTab] = useState<'attendance' | 'leaves'>('attendance');
  const getUserName = (id: string) => users.find(u => u.id === id)?.name ?? 'Unknown';
  const getUserAvatar = (id: string) => users.find(u => u.id === id)?.avatar ?? '??';
  const getUserPosition = (id: string) => users.find(u => u.id === id)?.position ?? '';

  const presentCount = attendanceRecords.filter(a => a.status === 'present').length;
  const absentCount = attendanceRecords.filter(a => a.status === 'absent' || a.status === 'leave').length;
  const wfhCount = attendanceRecords.filter(a => a.status === 'wfh').length;
  const avgHours = (attendanceRecords.reduce((s, a) => s + a.totalHours, 0) / attendanceRecords.length).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance & Leaves</h1>
          <p className="text-sm text-gray-500 mt-1">Track attendance and manage leave requests</p>
        </div>
        <button className="btn-primary"><Plus className="w-4 h-4" /> Apply Leave</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{presentCount}</p>
              <p className="text-xs text-gray-500">Present Today</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{absentCount}</p>
              <p className="text-xs text-gray-500">Absent / Leave</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{wfhCount}</p>
              <p className="text-xs text-gray-500">Work From Home</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{avgHours}h</p>
              <p className="text-xs text-gray-500">Avg Hours/Day</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        <button onClick={() => setTab('attendance')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'attendance' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
          Attendance
        </button>
        <button onClick={() => setTab('leaves')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'leaves' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
          Leave Requests
        </button>
      </div>

      {tab === 'attendance' ? (
        <div className="card overflow-hidden p-0">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">Today's Attendance - March 15, 2024</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input type="text" placeholder="Search..." className="pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48" />
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Employee</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Check In</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Check Out</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Hours</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map(record => (
                <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-semibold">
                        {getUserAvatar(record.userId)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{getUserName(record.userId)}</p>
                        <p className="text-xs text-gray-500">{getUserPosition(record.userId)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{record.checkIn}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{record.checkOut}</td>
                  <td className="px-4 py-3"><span className={`badge ${statusBadge[record.status]}`}>{record.status}</span></td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{record.totalHours > 0 ? `${record.totalHours}h` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-4">
          {leaveRequests.map(req => (
            <div key={req.id} className="card flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-semibold">
                  {getUserAvatar(req.userId)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{getUserName(req.userId)}</h3>
                    <span className={`badge ${leaveTypeBadge[req.type]}`}>{req.type}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{req.reason}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {req.startDate} to {req.endDate}</span>
                    <span>Applied: {req.appliedAt}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge ${leaveStatusBadge[req.status]}`}>{req.status}</span>
                {req.status === 'pending' && (
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600">Approve</button>
                    <button className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600">Reject</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
