import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot, Zap, TrendingUp, MessageSquare,
  ArrowRight, Sparkles, CircleDot, Power
} from 'lucide-react';
import { aiAgents } from '../data/aiAgentsData';
import type { AIAgent } from '../types';

const colorMap: Record<string, { bg: string; text: string; border: string; light: string; badge: string }> = {
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', light: 'bg-emerald-100', badge: 'bg-emerald-500' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', light: 'bg-blue-100', badge: 'bg-blue-500' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', light: 'bg-purple-100', badge: 'bg-purple-500' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', light: 'bg-amber-100', badge: 'bg-amber-500' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', light: 'bg-cyan-100', badge: 'bg-cyan-500' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', light: 'bg-rose-100', badge: 'bg-rose-500' },
};

export default function AIAgents() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'active' | 'idle'>('all');

  const filteredAgents = filter === 'all' ? aiAgents : aiAgents.filter(a => a.status === filter);

  const totalRequests = '18,765';
  const avgResponse = '< 3s';
  const satisfaction = '95%';
  const activeAgents = aiAgents.filter(a => a.status === 'active').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Agents</h1>
          <p className="text-gray-500 mt-1">Intelligent assistants powering your workspace</p>
        </div>
        <button
          onClick={() => navigate('/ai-agents/chat/chat-bot')}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
        >
          <Sparkles className="w-4 h-4" />
          Chat with AI
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeAgents}</p>
              <p className="text-sm text-gray-500">Active Agents</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalRequests}</p>
              <p className="text-sm text-gray-500">Total Requests</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{avgResponse}</p>
              <p className="text-sm text-gray-500">Avg Response</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{satisfaction}</p>
              <p className="text-sm text-gray-500">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'active', 'idle'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredAgents.map(agent => (
          <AgentCard key={agent.id} agent={agent} onChat={() => navigate(`/ai-agents/chat/${agent.id}`)} />
        ))}
      </div>
    </div>
  );
}

function AgentCard({ agent, onChat }: { agent: AIAgent; onChat: () => void }) {
  const colors = colorMap[agent.color] ?? colorMap.blue;

  return (
    <div className={`bg-white rounded-xl border ${colors.border} shadow-sm hover:shadow-md transition-all group`}>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 bg-gradient-to-br ${agent.gradient} rounded-xl flex items-center justify-center text-2xl shadow-sm`}>
              {agent.avatar}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{agent.name}</h3>
              <p className="text-xs text-gray-500">{agent.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <CircleDot className={`w-3 h-3 ${agent.status === 'active' ? 'text-emerald-500' : 'text-gray-400'}`} />
            <span className={`text-xs font-medium ${agent.status === 'active' ? 'text-emerald-600' : 'text-gray-400'}`}>
              {agent.status === 'active' ? 'Active' : 'Idle'}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{agent.description}</p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {agent.stats.map((stat, i) => (
            <div key={i} className={`${colors.bg} rounded-lg px-3 py-2`}>
              <p className={`text-sm font-bold ${colors.text}`}>{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Capabilities */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {agent.capabilities.slice(0, 3).map((cap, i) => (
            <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{cap}</span>
          ))}
          {agent.capabilities.length > 3 && (
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">+{agent.capabilities.length - 3} more</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onChat}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r ${agent.gradient} text-white rounded-lg hover:shadow-md transition-all text-sm font-medium`}
          >
            <MessageSquare className="w-4 h-4" />
            Chat Now
          </button>
          <button className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" title="Settings">
            <Power className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className={`px-5 py-3 ${colors.bg} rounded-b-xl border-t ${colors.border}`}>
        <p className="text-xs font-medium text-gray-500 mb-2">Quick Actions</p>
        <div className="flex flex-wrap gap-1.5">
          {agent.quickActions.map((action, i) => (
            <button
              key={i}
              onClick={onChat}
              className={`text-xs px-2.5 py-1 ${colors.light} ${colors.text} rounded-full hover:opacity-80 transition-opacity flex items-center gap-1`}
            >
              {action}
              <ArrowRight className="w-3 h-3" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
