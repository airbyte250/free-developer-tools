import type { AIAgent, AIAgentId, AIMessage } from '../types';

export const aiAgents: AIAgent[] = [
  {
    id: 'hr-assistant',
    name: 'HR Assistant',
    role: 'Human Resources AI',
    description: 'Handles leave requests, attendance queries, employee onboarding, policy questions, and HR workflows automatically.',
    avatar: '🧑‍💼',
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    status: 'active',
    capabilities: [
      'Leave request processing',
      'Attendance tracking & reports',
      'Employee onboarding checklist',
      'Policy Q&A',
      'Payroll queries',
      'Performance review scheduling',
    ],
    stats: [
      { label: 'Requests Handled', value: '847' },
      { label: 'Avg Response', value: '< 2s' },
      { label: 'Satisfaction', value: '96%' },
      { label: 'Active Today', value: '23' },
    ],
    quickActions: ['Apply for leave', 'Check attendance', 'Onboarding help', 'Company policies'],
  },
  {
    id: 'project-manager',
    name: 'Project Manager',
    role: 'Project Management AI',
    description: 'Manages task assignments, sprint planning, deadline tracking, resource allocation, and project status updates.',
    avatar: '📋',
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
    status: 'active',
    capabilities: [
      'Task auto-assignment',
      'Sprint planning assistance',
      'Deadline & milestone tracking',
      'Resource allocation',
      'Risk assessment',
      'Status report generation',
    ],
    stats: [
      { label: 'Tasks Managed', value: '1,245' },
      { label: 'Projects Active', value: '5' },
      { label: 'On-time Rate', value: '92%' },
      { label: 'Sprints Planned', value: '48' },
    ],
    quickActions: ['Create task', 'Sprint status', 'Assign resources', 'Risk report'],
  },
  {
    id: 'customer-support',
    name: 'Customer Support',
    role: 'Customer Support AI',
    description: 'Handles customer tickets, auto-replies, FAQ management, ticket routing, and escalation workflows.',
    avatar: '🎧',
    color: 'purple',
    gradient: 'from-purple-500 to-pink-600',
    status: 'active',
    capabilities: [
      'Auto-reply to common queries',
      'Ticket classification & routing',
      'FAQ knowledge base',
      'Escalation management',
      'Customer sentiment analysis',
      'SLA monitoring',
    ],
    stats: [
      { label: 'Tickets Resolved', value: '3,421' },
      { label: 'Avg Resolution', value: '4.2 min' },
      { label: 'CSAT Score', value: '4.8/5' },
      { label: 'Auto-resolved', value: '68%' },
    ],
    quickActions: ['View open tickets', 'Create FAQ', 'Escalation rules', 'SLA dashboard'],
  },
  {
    id: 'code-reviewer',
    name: 'Code Reviewer',
    role: 'Code Review AI',
    description: 'Reviews pull requests, identifies bugs, suggests improvements, checks code quality, and enforces best practices.',
    avatar: '🔍',
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    status: 'active',
    capabilities: [
      'PR review & feedback',
      'Bug detection',
      'Code quality analysis',
      'Security vulnerability scan',
      'Performance suggestions',
      'Style guide enforcement',
    ],
    stats: [
      { label: 'PRs Reviewed', value: '562' },
      { label: 'Bugs Found', value: '189' },
      { label: 'Accuracy', value: '94%' },
      { label: 'Avg Review Time', value: '3.5 min' },
    ],
    quickActions: ['Review latest PR', 'Code quality scan', 'Security audit', 'Style check'],
  },
  {
    id: 'analytics-assistant',
    name: 'Analytics Assistant',
    role: 'Data Analytics AI',
    description: 'Generates reports, analyzes trends, provides data insights, forecasts metrics, and creates visualizations.',
    avatar: '📊',
    color: 'cyan',
    gradient: 'from-cyan-500 to-blue-600',
    status: 'active',
    capabilities: [
      'Report generation',
      'Trend analysis',
      'Revenue forecasting',
      'Team productivity insights',
      'Custom data queries',
      'KPI dashboard creation',
    ],
    stats: [
      { label: 'Reports Generated', value: '234' },
      { label: 'Insights Shared', value: '1,567' },
      { label: 'Forecast Accuracy', value: '89%' },
      { label: 'Dashboards Created', value: '18' },
    ],
    quickActions: ['Generate report', 'Revenue forecast', 'Team analytics', 'KPI dashboard'],
  },
  {
    id: 'chat-bot',
    name: 'WorkSpace Bot',
    role: 'General Assistant AI',
    description: 'Answers team queries, schedules meetings, sets reminders, manages notifications, and helps with daily workflows.',
    avatar: '🤖',
    color: 'rose',
    gradient: 'from-rose-500 to-red-600',
    status: 'active',
    capabilities: [
      'Meeting scheduling',
      'Reminder management',
      'Team announcements',
      'Quick information lookup',
      'Workflow automation',
      'Daily standup facilitation',
    ],
    stats: [
      { label: 'Messages Handled', value: '12,456' },
      { label: 'Meetings Scheduled', value: '324' },
      { label: 'Reminders Set', value: '1,890' },
      { label: 'Active Users', value: '10' },
    ],
    quickActions: ['Schedule meeting', 'Set reminder', 'Team announcement', 'Daily standup'],
  },
];

export const agentGreetings: Record<AIAgentId, string> = {
  'hr-assistant': 'Namaste! 🙏 I\'m your HR Assistant. I can help you with leave requests, attendance queries, onboarding, company policies, and more. How can I help you today?',
  'project-manager': 'Hello! 📋 I\'m your AI Project Manager. I can help with task management, sprint planning, resource allocation, and project tracking. What would you like to work on?',
  'customer-support': 'Hi there! 🎧 I\'m the Customer Support AI. I can help resolve tickets, manage FAQs, route queries, and monitor SLAs. What do you need assistance with?',
  'code-reviewer': 'Hey developer! 🔍 I\'m the Code Review AI. I can review your PRs, scan for bugs, check security vulnerabilities, and enforce coding standards. What shall I review?',
  'analytics-assistant': 'Hello! 📊 I\'m your Analytics Assistant. I can generate reports, analyze trends, forecast metrics, and create dashboards. What data would you like to explore?',
  'chat-bot': 'Hi! 🤖 I\'m WorkSpace Bot, your general assistant. I can schedule meetings, set reminders, look up information, and help with daily workflows. What can I do for you?',
};

type AgentResponseMap = Record<string, { keywords: string[]; response: string; actions?: { label: string; type: 'link' | 'action' | 'confirm'; value: string }[] }[]>;

export const agentResponses: Record<AIAgentId, AgentResponseMap[string]> = {
  'hr-assistant': [
    {
      keywords: ['leave', 'chutti', 'holiday', 'vacation', 'time off', 'day off'],
      response: 'I can help you with leave management! Here\'s your current leave balance:\n\n📋 **Leave Balance (2024)**\n- Casual Leave: 8/12 remaining\n- Sick Leave: 6/7 remaining\n- Annual Leave: 15/20 remaining\n- WFH Days: 4/8 remaining\n\nWould you like to apply for leave or check someone else\'s balance?',
      actions: [
        { label: 'Apply Leave', type: 'action', value: 'apply-leave' },
        { label: 'View Calendar', type: 'link', value: '/calendar' },
      ],
    },
    {
      keywords: ['attendance', 'check in', 'check out', 'present', 'absent', 'hajri'],
      response: 'Here\'s today\'s attendance summary:\n\n✅ **Present:** 7 employees\n🏠 **Work From Home:** 1 (Amit Patel)\n🏖️ **On Leave:** 1 (Deepak Reddy)\n⏰ **Half Day:** 1 (Vikram Joshi)\n\n**Your Status:** Present (Check-in: 08:45, 9.75 hours logged)\n\nWant me to generate a detailed attendance report?',
      actions: [
        { label: 'Full Report', type: 'link', value: '/attendance' },
        { label: 'Mark Attendance', type: 'action', value: 'mark-attendance' },
      ],
    },
    {
      keywords: ['onboard', 'new employee', 'joining', 'new hire', 'welcome'],
      response: 'Here\'s the onboarding checklist for new employees:\n\n1. ✅ Welcome email sent\n2. ✅ IT setup (laptop, email, Slack)\n3. ⬜ ID card generation\n4. ⬜ Bank account form\n5. ⬜ NDA & policy acknowledgment\n6. ⬜ Team introduction meeting\n7. ⬜ First week training schedule\n\n**3 new hires** joining this month. Need me to prepare their onboarding kits?',
      actions: [
        { label: 'Prepare Kit', type: 'action', value: 'prepare-kit' },
        { label: 'View Team', type: 'link', value: '/team' },
      ],
    },
    {
      keywords: ['policy', 'rules', 'guideline', 'handbook', 'niyam'],
      response: 'Here are the most commonly asked policy topics:\n\n📖 **Company Policies**\n- Work Hours: 9:00 AM - 6:00 PM (flexible ±1 hour)\n- Remote Work: 2 WFH days per week allowed\n- Dress Code: Smart casual (Mon-Thu), Casual (Fri)\n- Leave Policy: 12 CL + 7 SL + 20 AL per year\n- Notice Period: 60 days for all employees\n\nAsk me about any specific policy!',
    },
    {
      keywords: ['salary', 'payroll', 'payment', 'pay', 'compensation', 'tankhwah'],
      response: 'I can help with payroll queries!\n\n💰 **Payroll Status - March 2024**\n- Processing Date: March 25\n- Payment Date: March 28\n- Status: ⏳ Pending\n\n**Your Last Payslip (Feb 2024):**\n- Gross: ₹1,20,000\n- Deductions: ₹28,500\n- Net Pay: ₹91,500\n\nNeed a detailed breakdown or want to download your payslip?',
    },
  ],
  'project-manager': [
    {
      keywords: ['task', 'assign', 'create task', 'new task', 'kaam'],
      response: 'I\'ll help you manage tasks! Here\'s the current overview:\n\n📊 **Task Summary**\n- To Do: 4 tasks\n- In Progress: 4 tasks\n- In Review: 2 tasks\n- Done: 2 tasks\n\n**High Priority Unassigned:**\n1. "Setup payment gateway" — Urgent, due Apr 15\n2. "Build shopping cart UI" — Medium, due Apr 10\n\nWant me to auto-assign based on team workload?',
      actions: [
        { label: 'Auto-assign', type: 'action', value: 'auto-assign' },
        { label: 'View Kanban', type: 'link', value: '/projects' },
      ],
    },
    {
      keywords: ['sprint', 'planning', 'backlog', 'scrum', 'agile'],
      response: '🏃 **Sprint 12 Status**\n- Duration: Mar 11 - Mar 25 (Day 5 of 14)\n- Velocity: 34 story points planned\n- Completed: 12 points (35%)\n- Burndown: ⚠️ Slightly behind schedule\n\n**Blockers:**\n- Payment gateway API access pending\n- Design review for mobile screens needed\n\nShall I create Sprint 13 planning or adjust current sprint?',
      actions: [
        { label: 'Plan Sprint 13', type: 'action', value: 'plan-sprint' },
        { label: 'View Projects', type: 'link', value: '/projects' },
      ],
    },
    {
      keywords: ['status', 'progress', 'update', 'report', 'sthiti'],
      response: '📈 **Project Status Report**\n\n🟢 **E-Commerce Platform** — 68% complete\n- On track, 5 tasks remaining\n- Due: June 30, 2024\n\n🟡 **Mobile App Redesign** — 45% complete\n- Slightly behind, design review pending\n- Due: May 30, 2024\n\n🟢 **HR Portal** — 82% complete\n- Ahead of schedule!\n- Due: May 15, 2024\n\nWant a detailed breakdown for any project?',
      actions: [
        { label: 'Detailed Report', type: 'link', value: '/reports' },
      ],
    },
    {
      keywords: ['resource', 'workload', 'capacity', 'bandwidth', 'available'],
      response: '👥 **Team Workload Analysis**\n\n🔴 Rahul Verma — 95% utilized (overloaded)\n🟡 Vikram Joshi — 80% utilized\n🟡 Amit Patel — 75% utilized\n🟢 Kavita Nair — 60% utilized\n🟢 Anita Sharma — 55% utilized\n🟢 Sonal Mehta — 50% utilized\n\n⚠️ **Recommendation:** Redistribute 2 tasks from Rahul to Kavita/Sonal to balance workload.\n\nShall I auto-redistribute?',
      actions: [
        { label: 'Redistribute', type: 'confirm', value: 'redistribute-tasks' },
        { label: 'View Team', type: 'link', value: '/team' },
      ],
    },
    {
      keywords: ['deadline', 'due', 'milestone', 'timeline'],
      response: '📅 **Upcoming Deadlines**\n\n🔴 Mar 20 — Unit test auth (Kavita) — 2 days left\n🟡 Apr 01 — Product catalog API (Rahul) — 17 days\n🟡 Apr 05 — Home screen redesign (Sonal) — 21 days\n🟢 Apr 10 — Shopping cart UI (Vikram) — 26 days\n🟢 Apr 15 — Payment gateway (Amit) — 31 days\n\nWant me to send reminder notifications to the team?',
      actions: [
        { label: 'Send Reminders', type: 'action', value: 'send-reminders' },
        { label: 'View Calendar', type: 'link', value: '/calendar' },
      ],
    },
  ],
  'customer-support': [
    {
      keywords: ['ticket', 'issue', 'problem', 'complaint', 'samasya'],
      response: '🎫 **Open Tickets Overview**\n\n🔴 **Critical (2)**\n- #1089 — Payment failure on checkout (3 reports)\n- #1092 — Login loop on mobile app\n\n🟡 **High (5)**\n- #1085 — Order tracking not updating\n- #1087 — Coupon code not applying\n- ... and 3 more\n\n🟢 **Medium/Low (12)** — Auto-resolved: 8\n\nWhich ticket should I prioritize?',
      actions: [
        { label: 'Prioritize #1089', type: 'action', value: 'prioritize-1089' },
        { label: 'Auto-resolve Low', type: 'action', value: 'auto-resolve' },
      ],
    },
    {
      keywords: ['faq', 'question', 'common', 'frequent', 'sawaal'],
      response: '📚 **Top FAQs This Week**\n\n1. "How to reset password?" — 145 queries (auto-resolved)\n2. "Where is my order?" — 98 queries (auto-resolved)\n3. "How to apply coupon?" — 67 queries (auto-resolved)\n4. "Return/refund policy?" — 54 queries\n5. "Payment methods accepted?" — 42 queries\n\n**Auto-resolution rate: 68%** ✅\n\nWant me to update any FAQ answers?',
    },
    {
      keywords: ['escalat', 'urgent', 'critical', 'manager', 'senior'],
      response: '⚠️ **Escalation Dashboard**\n\nCurrently escalated tickets: **3**\n\n1. #1089 — Payment failure → Assigned to: Rahul Verma\n   - Escalated 2 hours ago, SLA: 4 hours remaining\n2. #1092 — Login loop → Assigned to: Vikram Joshi\n   - Escalated 1 hour ago, SLA: 5 hours remaining\n3. #1078 — Data discrepancy → Assigned to: Amit Patel\n   - Escalated yesterday, SLA: ⚠️ Breached\n\nShall I send follow-up notifications?',
      actions: [
        { label: 'Send Follow-ups', type: 'action', value: 'send-followups' },
        { label: 'Reassign #1078', type: 'action', value: 'reassign-1078' },
      ],
    },
    {
      keywords: ['sentiment', 'satisfaction', 'feedback', 'rating', 'csat'],
      response: '😊 **Customer Sentiment Analysis — March 2024**\n\n- **CSAT Score:** 4.8/5.0 (+0.2 from Feb)\n- **NPS Score:** 72 (Excellent)\n- **Response Time:** 4.2 min avg\n- **First Contact Resolution:** 82%\n\n**Sentiment Breakdown:**\n- 😊 Positive: 78%\n- 😐 Neutral: 15%\n- 😟 Negative: 7%\n\nTop complaint: "Slow checkout process" (14 mentions)',
    },
  ],
  'code-reviewer': [
    {
      keywords: ['review', 'pr', 'pull request', 'merge', 'code'],
      response: '🔍 **Pending Pull Requests**\n\n**PR #142** — feature/product-search (Rahul)\n- Files: 12 changed, +340 / -45\n- ⚠️ 3 issues found:\n  1. Missing error handling in API call (line 45)\n  2. Unused import `useState` (line 2)\n  3. Magic number `5` should be constant (line 78)\n- ✅ Tests passing, coverage: 87%\n\n**PR #143** — fix/cart-calculation (Vikram)\n- Files: 3 changed, +28 / -12\n- ✅ No issues found, ready to merge\n\nShall I approve PR #143 and request changes on #142?',
      actions: [
        { label: 'Approve #143', type: 'confirm', value: 'approve-143' },
        { label: 'Request Changes #142', type: 'action', value: 'request-changes-142' },
      ],
    },
    {
      keywords: ['bug', 'error', 'issue', 'fix', 'debug'],
      response: '🐛 **Bug Detection Report**\n\nI scanned the codebase and found:\n\n🔴 **Critical (1)**\n- Division by zero in `Goals.tsx:122` when `kr.target === 0`\n  → Fix: Add guard clause before division\n\n🟡 **Warning (3)**\n- Potential memory leak in `TimeTracking.tsx` — timer not cleaned up\n- Missing `key` prop in map iteration in `Activity.tsx:45`\n- Unhandled promise rejection in `Documents.tsx:89`\n\n🟢 **Info (5)**\n- 5 unused variables across 3 files\n\nWant me to generate fix suggestions?',
      actions: [
        { label: 'Generate Fixes', type: 'action', value: 'generate-fixes' },
        { label: 'View Details', type: 'action', value: 'view-bug-details' },
      ],
    },
    {
      keywords: ['security', 'vulnerability', 'secure', 'audit', 'suraksha'],
      response: '🔒 **Security Audit Results**\n\n**Overall Score: 87/100** (Good)\n\n✅ No SQL injection vulnerabilities\n✅ XSS protection in place\n✅ CORS properly configured\n⚠️ 2 medium issues:\n  1. API keys should use environment variables (3 instances)\n  2. Missing rate limiting on login endpoint\n❌ 1 high issue:\n  1. JWT token expiry set to 30 days (recommend: 24 hours)\n\nShall I create tickets for these security issues?',
      actions: [
        { label: 'Create Tickets', type: 'action', value: 'create-security-tickets' },
      ],
    },
    {
      keywords: ['quality', 'lint', 'standard', 'style', 'format'],
      response: '📏 **Code Quality Report**\n\n**Maintainability Index: A (92/100)**\n\n- TypeScript strict mode: ✅ Enabled\n- ESLint errors: 0\n- ESLint warnings: 4\n- Test coverage: 85%\n- Duplicated code: 2.3%\n- Cyclomatic complexity: Low\n\n**Style Violations:**\n- 2 files missing JSDoc comments\n- 1 function exceeds 50 lines\n- 3 TODO comments need resolution\n\nOverall: Very clean codebase! 🎉',
    },
  ],
  'analytics-assistant': [
    {
      keywords: ['report', 'generate', 'create', 'summary', 'vivaran'],
      response: '📊 **Generated Report — March 2024**\n\n**Key Metrics:**\n- Revenue: ₹28L (↑12% MoM)\n- Tasks Completed: 358 (↑8%)\n- Productivity Score: 92%\n- Customer Satisfaction: 4.8/5\n\n**Top Performers:**\n1. 🥇 Rahul Verma — 45 tasks completed\n2. 🥈 Vikram Joshi — 38 tasks completed\n3. 🥉 Kavita Nair — 35 tasks completed\n\n**Areas of Concern:**\n- Mobile App Redesign is 15% behind schedule\n- Sales team productivity dropped 5%\n\nWant me to export this as PDF?',
      actions: [
        { label: 'Export PDF', type: 'action', value: 'export-pdf' },
        { label: 'View Reports', type: 'link', value: '/reports' },
      ],
    },
    {
      keywords: ['trend', 'forecast', 'predict', 'future', 'bhavishya'],
      response: '📈 **Revenue Forecast — Q2 2024**\n\nBased on current trends:\n- April: ₹32L (projected, ↑14%)\n- May: ₹35L (projected, ↑10%)\n- June: ₹38L (projected, ↑9%)\n\n**Q2 Total Forecast: ₹1.05 Cr** 🎯\n- vs Q1 Actual: ₹78L\n- Growth: +34.6%\n\n**Confidence Level: 89%**\n\n⚠️ Risk factor: E-Commerce launch delay could impact June numbers by -15%\n\nWant to see the detailed projection model?',
    },
    {
      keywords: ['productivity', 'performance', 'team', 'efficiency', 'karyakshamta'],
      response: '👥 **Team Productivity Analysis**\n\n**Department Scores:**\n- 🏆 Engineering: 92% (↑4%)\n- 🥈 HR: 90% (↑2%)\n- 🥉 Design: 88% (↑6%)\n- Marketing: 85% (↑1%)\n- Sales: 78% (↓5%)\n\n**Key Insights:**\n1. Engineering peak hours: 10 AM - 1 PM\n2. Design team most productive on Wed/Thu\n3. Sales team needs attention — dropped 5% this month\n\n**Recommendation:** Schedule sales team coaching session',
      actions: [
        { label: 'Schedule Coaching', type: 'action', value: 'schedule-coaching' },
        { label: 'View Analytics', type: 'link', value: '/reports' },
      ],
    },
    {
      keywords: ['kpi', 'dashboard', 'metric', 'goal', 'target'],
      response: '🎯 **KPI Dashboard — Live**\n\n| KPI | Target | Actual | Status |\n|-----|--------|--------|--------|\n| Revenue | ₹50L/mo | ₹28L | 🟡 56% |\n| New Customers | 500 | 280 | 🟡 56% |\n| App Rating | 4.5 ⭐ | 4.0 ⭐ | 🟡 89% |\n| Employee Retention | 95% | 92% | 🟢 97% |\n| Test Coverage | 95% | 85% | 🟡 89% |\n| Bugs (Critical) | 0 | 2 | 🔴 |\n\n3 out of 6 KPIs need attention. Want me to create action plans?',
    },
  ],
  'chat-bot': [
    {
      keywords: ['meeting', 'schedule', 'calendar', 'book', 'baithak'],
      response: '📅 **Meeting Scheduler**\n\nI found these available slots for your team:\n\n- **Today 4:00 PM** — All team members available\n- **Tomorrow 10:00 AM** — 8/10 members available (Deepak on leave)\n- **Tomorrow 2:00 PM** — 9/10 members available\n\n**Upcoming Meetings:**\n- All Hands Meeting — Today 3:00 PM\n- Sprint Planning — Mar 18, 10:00 AM\n- Design Review — Mar 19, 2:00 PM\n\nWhich slot works for you?',
      actions: [
        { label: 'Book 4:00 PM Today', type: 'action', value: 'book-today-4pm' },
        { label: 'Book Tomorrow 10 AM', type: 'action', value: 'book-tomorrow-10am' },
        { label: 'View Calendar', type: 'link', value: '/calendar' },
      ],
    },
    {
      keywords: ['remind', 'reminder', 'alert', 'notify', 'yaad'],
      response: '⏰ **Reminder Manager**\n\n**Your Active Reminders:**\n1. 🔔 Sprint review — Today 5:00 PM\n2. 🔔 Submit expense report — Tomorrow\n3. 🔔 Team lunch — Mar 20, 12:30 PM\n4. 🔔 E-Commerce MVP deadline — Mar 22\n\nWant to set a new reminder? Just tell me what and when!\n\nExample: "Remind me to review PRs at 2 PM tomorrow"',
      actions: [
        { label: 'Set New Reminder', type: 'action', value: 'new-reminder' },
        { label: 'Clear All', type: 'confirm', value: 'clear-reminders' },
      ],
    },
    {
      keywords: ['announce', 'notification', 'broadcast', 'message all', 'sabko batao'],
      response: '📢 **Team Announcement System**\n\nRecent Announcements:\n1. "All Hands Meeting at 3 PM" — by Pawan Kumar\n2. "Fill employee survey by Friday" — by Neha Gupta\n3. "Q2 Marketing Plan shared" — by Priya Singh\n\nDraft a new announcement for the team? I\'ll send it to all channels and email.\n\nYou can say something like: "Announce: Office will be closed on Holi (Mar 25)"',
      actions: [
        { label: 'New Announcement', type: 'action', value: 'new-announcement' },
        { label: 'View Activity', type: 'link', value: '/activity' },
      ],
    },
    {
      keywords: ['standup', 'daily', 'morning', 'update', 'subah'],
      response: '🌅 **Daily Standup Summary — March 15, 2024**\n\n**Submitted (7/10):**\n\n👤 **Rahul Verma** (Engineering)\n- Yesterday: Completed product catalog API\n- Today: API testing and documentation\n- Blockers: None\n\n👤 **Anita Sharma** (Design)\n- Yesterday: Navigation mockups\n- Today: Design iterations\n- Blockers: Waiting for feedback from PM\n\n👤 **Vikram Joshi** (Engineering)\n- Yesterday: Shopping cart UI\n- Today: Cart calculation fixes\n- Blockers: None\n\n... and 4 more submitted.\n\n⚠️ **Not Submitted:** Deepak Reddy (leave), Amit Patel (WFH), Sonal Mehta (pending)',
    },
    {
      keywords: ['help', 'what can you do', 'features', 'kya kar sakte ho', 'madad'],
      response: '🤖 **I can help you with:**\n\n1. 📅 **Schedule meetings** — "Schedule a meeting with Rahul tomorrow"\n2. ⏰ **Set reminders** — "Remind me to review PRs at 2 PM"\n3. 📢 **Send announcements** — "Announce: Office closed on Holi"\n4. 🌅 **Daily standups** — "Show today\'s standup summary"\n5. 🔍 **Look up info** — "What\'s Rahul\'s email?" or "How many tasks are pending?"\n6. 📊 **Quick stats** — "Show project progress" or "Team attendance today"\n\nJust type naturally and I\'ll understand! 😊',
    },
  ],
};

export function getAgentResponse(agentId: AIAgentId, userMessage: string): AIMessage {
  const responses = agentResponses[agentId];
  const lowerMsg = userMessage.toLowerCase();

  const matched = responses.find(r =>
    r.keywords.some(kw => lowerMsg.includes(kw))
  );

  const fallbackResponses: Record<AIAgentId, string> = {
    'hr-assistant': 'I can help with leave requests, attendance, onboarding, policies, and payroll. Could you be more specific about what you need? 😊',
    'project-manager': 'I can help with task management, sprint planning, project status, resource allocation, and deadlines. What specific area do you need help with?',
    'customer-support': 'I can help with tickets, FAQs, escalations, and customer sentiment analysis. What would you like to know about?',
    'code-reviewer': 'I can review PRs, detect bugs, run security audits, and check code quality. What would you like me to analyze?',
    'analytics-assistant': 'I can generate reports, analyze trends, forecast metrics, and track KPIs. What data are you interested in?',
    'chat-bot': 'I can schedule meetings, set reminders, send announcements, and help with daily workflows. Try asking me something specific! Type "help" to see all my capabilities.',
  };

  return {
    id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    agentId,
    role: 'agent',
    content: matched?.response ?? fallbackResponses[agentId],
    timestamp: new Date().toISOString(),
    actions: matched?.actions,
  };
}
