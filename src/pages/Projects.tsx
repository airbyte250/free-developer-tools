import { useState } from 'react';
import {
  Plus, Filter, LayoutGrid, List, Search, MoreVertical,
  Calendar, Users as UsersIcon, ArrowRight, Flag
} from 'lucide-react';
import { projects, tasks, users } from '../data/mockData';
import type { Task } from '../types';

const priorityColors = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const statusColors = {
  todo: 'bg-gray-100 text-gray-600',
  'in-progress': 'bg-amber-100 text-amber-700',
  review: 'bg-cyan-100 text-cyan-700',
  done: 'bg-emerald-100 text-emerald-700',
};

export default function Projects() {
  const [view, setView] = useState<'board' | 'list'>('board');
  const [selectedProject, setSelectedProject] = useState(projects[0].id);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium' as Task['priority'], status: 'todo' as Task['status'] });

  const projectTasks = tasks.filter(t => t.projectId === selectedProject);
  const currentProject = projects.find(p => p.id === selectedProject);
  const columns: Task['status'][] = ['todo', 'in-progress', 'review', 'done'];
  const columnLabels = { todo: 'To Do', 'in-progress': 'In Progress', review: 'In Review', done: 'Done' };

  const getUserName = (id: string) => users.find(u => u.id === id)?.name ?? 'Unknown';
  const getUserAvatar = (id: string) => users.find(u => u.id === id)?.avatar ?? '??';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">{projects.length} projects · {tasks.length} tasks</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddTask(true)}>
          <Plus className="w-4 h-4" /> New Task
        </button>
      </div>

      {showAddTask && (
        <div className="card border-indigo-200 bg-indigo-50/30">
          <h3 className="font-semibold text-gray-900 mb-3">Add New Task</h3>
          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Task title..."
              value={newTask.title}
              onChange={e => setNewTask({ ...newTask, title: e.target.value })}
              className="input-field flex-1 min-w-[200px]"
            />
            <select
              value={newTask.priority}
              onChange={e => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
              className="input-field w-32"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <select
              value={newTask.status}
              onChange={e => setNewTask({ ...newTask, status: e.target.value as Task['status'] })}
              className="input-field w-36"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="review">In Review</option>
              <option value="done">Done</option>
            </select>
            <button className="btn-primary" onClick={() => setShowAddTask(false)}>Add</button>
            <button className="btn-secondary" onClick={() => setShowAddTask(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="flex gap-3 overflow-x-auto pb-2">
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => setSelectedProject(project.id)}
            className={`flex-shrink-0 px-4 py-3 rounded-xl border transition-all ${
              selectedProject === project.id
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200'
                : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
            }`}
          >
            <div className="text-left">
              <p className="text-sm font-semibold">{project.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs ${selectedProject === project.id ? 'text-indigo-200' : 'text-gray-500'}`}>
                  {tasks.filter(t => t.projectId === project.id).length} tasks
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  selectedProject === project.id ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {project.progress}%
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {currentProject && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{currentProject.name}</h2>
              <p className="text-sm text-gray-500">{currentProject.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3.5 h-3.5" /> Due: {currentProject.dueDate}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <UsersIcon className="w-3.5 h-3.5" /> {currentProject.teamMembers.length} members
              </div>
              <div className="flex -space-x-2 ml-2">
                {currentProject.teamMembers.slice(0, 4).map(id => (
                  <div key={id} className="w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-semibold border-2 border-white">
                    {getUserAvatar(id)}
                  </div>
                ))}
                {currentProject.teamMembers.length > 4 && (
                  <div className="w-7 h-7 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-xs font-semibold border-2 border-white">
                    +{currentProject.teamMembers.length - 4}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
            <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${currentProject.progress}%` }} />
          </div>
          <p className="text-xs text-gray-500">{currentProject.progress}% complete</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search tasks..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64" />
          </div>
          <button className="btn-secondary">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button onClick={() => setView('board')} className={`p-2 rounded-md transition-colors ${view === 'board' ? 'bg-white shadow-sm' : 'text-gray-500'}`}>
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button onClick={() => setView('list')} className={`p-2 rounded-md transition-colors ${view === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'}`}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {view === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((col) => {
            const colTasks = projectTasks.filter(t => t.status === col);
            return (
              <div key={col} className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`badge ${statusColors[col]}`}>{columnLabels[col]}</span>
                    <span className="text-xs text-gray-400">{colTasks.length}</span>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  {colTasks.map((task) => (
                    <div key={task.id} className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <span className={`badge text-[10px] ${priorityColors[task.priority]}`}>
                          <Flag className="w-2.5 h-2.5 mr-0.5" /> {task.priority}
                        </span>
                        <button className="text-gray-300 hover:text-gray-500">
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">{task.title}</h4>
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-[10px] font-semibold" title={getUserName(task.assignee)}>
                          {getUserAvatar(task.assignee)}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Calendar className="w-3 h-3" /> {task.dueDate.slice(5)}
                        </div>
                      </div>
                      {task.tags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {task.tags.map(tag => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {colTasks.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">No tasks</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Task</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Assignee</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Due Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {projectTasks.map((task) => (
                <tr key={task.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                    <p className="text-xs text-gray-500">{task.description.slice(0, 60)}...</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${statusColors[task.status]}`}>{columnLabels[task.status]}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${priorityColors[task.priority]}`}>{task.priority}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-semibold">
                        {getUserAvatar(task.assignee)}
                      </div>
                      <span className="text-sm text-gray-700">{getUserName(task.assignee)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{task.dueDate}</td>
                  <td className="px-4 py-3">
                    <button className="text-gray-400 hover:text-gray-600"><ArrowRight className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
