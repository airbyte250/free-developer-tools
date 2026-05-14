import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Send, ArrowLeft, Sparkles, CircleDot, ChevronDown,
  RotateCcw, Copy, Check, ExternalLink
} from 'lucide-react';
import { aiAgents, agentGreetings, getAgentResponse } from '../data/aiAgentsData';
import type { AIAgentId, AIMessage } from '../types';

export default function AIChat() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const validAgentId = agentId && aiAgents.some(a => a.id === agentId) ? (agentId as AIAgentId) : 'chat-bot';
  const selectedAgent = validAgentId;
  const [messages, setMessages] = useState<Record<AIAgentId, AIMessage[]>>(() => {
    const initial: Partial<Record<AIAgentId, AIMessage[]>> = {};
    for (const agent of aiAgents) {
      initial[agent.id] = [
        {
          id: `greeting-${agent.id}`,
          agentId: agent.id,
          role: 'agent',
          content: agentGreetings[agent.id],
          timestamp: new Date().toISOString(),
        },
      ];
    }
    return initial as Record<AIAgentId, AIMessage[]>;
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAgentList, setShowAgentList] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const currentAgent = aiAgents.find(a => a.id === selectedAgent) ?? aiAgents[0];
  const agentMessages = messages[selectedAgent] ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agentMessages.length, isTyping]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: AIMessage = {
      id: `user-${Date.now()}`,
      agentId: selectedAgent,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => ({
      ...prev,
      [selectedAgent]: [...(prev[selectedAgent] ?? []), userMsg],
    }));
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const agentReply = getAgentResponse(selectedAgent, text);
      setMessages(prev => ({
        ...prev,
        [selectedAgent]: [...(prev[selectedAgent] ?? []), agentReply],
      }));
      setIsTyping(false);
    }, 800 + Math.random() * 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const switchAgent = (id: AIAgentId) => {
    setShowAgentList(false);
    navigate(`/ai-agents/chat/${id}`, { replace: true });
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-semibold text-gray-900">{line.replace(/\*\*/g, '')}</p>;
      }
      if (line.startsWith('- ')) {
        return <p key={i} className="pl-2">{line}</p>;
      }
      if (line.startsWith('| ')) {
        return <p key={i} className="font-mono text-xs">{line}</p>;
      }
      if (line.match(/^\d+\./)) {
        return <p key={i} className="pl-2">{line}</p>;
      }
      if (line === '') {
        return <br key={i} />;
      }
      return <p key={i}>{line}</p>;
    });
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Agent Sidebar */}
      <div className="w-72 border-r border-gray-100 flex flex-col bg-gray-50/50">
        <div className="p-4 border-b border-gray-100 bg-white">
          <button
            onClick={() => navigate('/ai-agents')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Agents
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">AI Agents</h2>
              <p className="text-xs text-gray-500">{aiAgents.filter(a => a.status === 'active').length} active</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {aiAgents.map(agent => (
            <button
              key={agent.id}
              onClick={() => switchAgent(agent.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white transition-colors ${
                selectedAgent === agent.id ? 'bg-white border-r-2 border-indigo-600 shadow-sm' : ''
              }`}
            >
              <div className={`w-10 h-10 bg-gradient-to-br ${agent.gradient} rounded-xl flex items-center justify-center text-lg shadow-sm`}>
                {agent.avatar}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className={`text-sm font-medium truncate ${
                  selectedAgent === agent.id ? 'text-indigo-700' : 'text-gray-700'
                }`}>
                  {agent.name}
                </p>
                <p className="text-xs text-gray-400 truncate">{agent.role}</p>
              </div>
              <CircleDot className={`w-3 h-3 flex-shrink-0 ${
                agent.status === 'active' ? 'text-emerald-500' : 'text-gray-300'
              }`} />
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${currentAgent.gradient} rounded-xl flex items-center justify-center text-lg shadow-sm`}>
              {currentAgent.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{currentAgent.name}</h3>
                <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium flex items-center gap-1">
                  <CircleDot className="w-2.5 h-2.5" /> Online
                </span>
              </div>
              <p className="text-xs text-gray-500">{currentAgent.description.slice(0, 60)}...</p>
            </div>
          </div>

          {/* Mobile agent switcher */}
          <div className="relative md:hidden">
            <button
              onClick={() => setShowAgentList(!showAgentList)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronDown className="w-5 h-5 text-gray-500" />
            </button>
            {showAgentList && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                {aiAgents.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => switchAgent(agent.id)}
                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm"
                  >
                    <span className="text-lg">{agent.avatar}</span>
                    <span className={selectedAgent === agent.id ? 'text-indigo-600 font-medium' : 'text-gray-700'}>{agent.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gray-50/30">
          {agentMessages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.role === 'agent' ? (
                  <div className={`w-8 h-8 bg-gradient-to-br ${currentAgent.gradient} rounded-lg flex items-center justify-center text-sm flex-shrink-0 shadow-sm`}>
                    {currentAgent.avatar}
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-xs text-white font-bold flex-shrink-0">
                    PK
                  </div>
                )}
                <div>
                  <div className={`rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                      : 'bg-white border border-gray-100 shadow-sm text-gray-700'
                  }`}>
                    <div className="text-sm leading-relaxed whitespace-pre-line">
                      {msg.role === 'agent' ? formatContent(msg.content) : msg.content}
                    </div>
                  </div>

                  {/* Message Actions (for agent messages) */}
                  {msg.role === 'agent' && (
                    <div className="flex items-center gap-1 mt-1.5 ml-1">
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors"
                        title="Copy"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors" title="Regenerate">
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {msg.actions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if (action.type === 'link') {
                              navigate(action.value);
                            } else {
                              handleQuickAction(action.label);
                            }
                          }}
                          className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-colors flex items-center gap-1"
                        >
                          {action.label}
                          {action.type === 'link' && <ExternalLink className="w-3 h-3" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 bg-gradient-to-br ${currentAgent.gradient} rounded-lg flex items-center justify-center text-sm flex-shrink-0 shadow-sm`}>
                {currentAgent.avatar}
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {agentMessages.length <= 1 && (
          <div className="px-6 py-3 border-t border-gray-100 bg-white">
            <p className="text-xs text-gray-500 mb-2">Quick Actions</p>
            <div className="flex flex-wrap gap-2">
              {currentAgent.quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickAction(action)}
                  className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask ${currentAgent.name} anything...`}
                rows={1}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none max-h-32"
                style={{ minHeight: '44px' }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className={`p-3 rounded-xl transition-all ${
                input.trim() && !isTyping
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            AI responses are generated locally with mock data. Connect a backend for live AI.
          </p>
        </div>
      </div>
    </div>
  );
}
