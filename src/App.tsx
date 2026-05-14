import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Team from './pages/Team';
import Chat from './pages/Chat';
import Activity from './pages/Activity';
import CalendarPage from './pages/CalendarPage';
import TimeTracking from './pages/TimeTracking';
import Reports from './pages/Reports';
import Documents from './pages/Documents';
import Attendance from './pages/Attendance';
import Goals from './pages/Goals';
import AIAgents from './pages/AIAgents';
import AIChat from './pages/AIChat';
import Settings from './pages/Settings';
import BrowserPage from './pages/BrowserPage';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} />
        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <Header />
          <main className="p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/team" element={<Team />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/activity" element={<Activity />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/time-tracking" element={<TimeTracking />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/ai-agents" element={<AIAgents />} />
              <Route path="/ai-agents/chat/:agentId" element={<AIChat />} />
              <Route path="/browser" element={<BrowserPage />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
